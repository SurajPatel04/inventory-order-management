from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderRead, OrderStatusUpdate
from app.schemas.pagination import PaginatedResponse
from sqlalchemy import func

router = APIRouter(prefix="/orders", tags=["orders"])

@router.put("/{order_id}/status", response_model=OrderRead)
def update_order_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.scalars(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    ).first()
    
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order {order_id} not found.",
        )
        
    try:
        order.status = payload.status
        db.commit()
        db.refresh(order)
    except Exception:
        db.rollback()
        raise
        
    return order


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    customer = db.get(Customer, payload.customer_id)
    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer {payload.customer_id} not found.",
        )

    product_ids = [item.product_id for item in payload.items]
    if len(product_ids) != len(set(product_ids)):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Each product may appear only once per order.",
        )

    order = Order(customer_id=payload.customer_id, total_amount=0, status="confirmed")
    total = 0

    for item in payload.items:
        product = db.scalars(
            select(Product).where(Product.id == item.product_id).with_for_update()
        ).first()

        if product is None:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found.",
            )

        if product.quantity < item.quantity:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Insufficient stock for '{product.name}': "
                    f"requested {item.quantity}, available {product.quantity}."
                ),
            )

        subtotal = product.price * item.quantity
        total += subtotal
        product.quantity -= item.quantity

        order.items.append(
            OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                unit_price=product.price,
                subtotal=subtotal,
            )
        )

    order.total_amount = total

    try:
        db.add(order)
        db.commit()
        db.refresh(order)
    except Exception:
        db.rollback()
        raise
        
    return order

@router.get("", response_model=PaginatedResponse[OrderRead])
def list_orders(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    customer_id: int | None = None,
    status: str | None = None,
):
    query = select(Order)
    if customer_id is not None:
        query = query.where(Order.customer_id == customer_id)
    if status is not None:
        query = query.where(Order.status == status)
        
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    items_query = query.options(selectinload(Order.items)).order_by(Order.id.desc()).offset(skip).limit(limit)
    items = db.scalars(items_query).all()
    
    return {
        "items": items,
        "total": total or 0,
        "skip": skip,
        "limit": limit
    }


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.scalars(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    ).first()
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order {order_id} not found.",
        )
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.scalars(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    ).first()
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order {order_id} not found.",
        )

    try:
        for item in order.items:
            product = db.get(Product, item.product_id)
            if product is not None:
                product.quantity += item.quantity

        db.delete(order)
        db.commit()
    except Exception:
        db.rollback()
        raise
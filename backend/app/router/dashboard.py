from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_products = db.scalar(select(func.count()).select_from(Product))
    total_customers = db.scalar(select(func.count()).select_from(Customer))
    total_orders = db.scalar(select(func.count()).select_from(Order))
    LOW_STOCK_THRESHOLD = 5
    low_stock_products = db.scalars(
        select(Product).where(Product.quantity < LOW_STOCK_THRESHOLD)
    ).all()
    
    recent_orders = db.scalars(
        select(Order).options(selectinload(Order.items)).order_by(Order.id.desc()).limit(4)
    ).all()
    
    return {
        "total_products": total_products or 0,
        "total_customers": total_customers or 0,
        "total_orders": total_orders or 0,
        "low_stock_threshold": LOW_STOCK_THRESHOLD,
        "low_stock_products": low_stock_products,
        "recent_orders": recent_orders,
    }
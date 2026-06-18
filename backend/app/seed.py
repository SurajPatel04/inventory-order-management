"""Seed the database with demo data: products, customers, and real orders.

Run from the backend/ directory:  uv run python -m app.seed
"""
from app.db.session import SessionLocal
from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product


def seed() -> None:
    db = SessionLocal()
    try:
        if db.query(Product).first() is not None:
            print("Database already has data — skipping seed.")
            return

        products = [
            Product(name="Wireless Mouse", sku="WM-001", price=24.99, quantity=150),
            Product(name="Mechanical Keyboard", sku="KB-002", price=89.99, quantity=75),
            Product(name="USB-C Hub", sku="HUB-003", price=39.50, quantity=8),  # low stock
            Product(name="27-inch Monitor", sku="MON-004", price=299.00, quantity=40),
            Product(name="Laptop Stand", sku="LS-005", price=34.95, quantity=3),  # low stock
        ]
        customers = [
            Customer(full_name="Aarav Sharma", email="aarav@example.com", phone="+91 90000 11111"),
            Customer(full_name="Diya Patel", email="diya@example.com", phone="+91 90000 22222"),
            Customer(full_name="Rohan Mehta", email="rohan@example.com", phone="+91 90000 33333"),
        ]

        db.add_all(products + customers)
        db.commit()
        for obj in products + customers:
            db.refresh(obj)

        # Place two real orders, decrementing stock the same way the API does
        order1 = Order(customer_id=customers[0].id, status="confirmed")
        for product, qty in [(products[0], 2), (products[1], 1)]:
            subtotal = product.price * qty
            product.quantity -= qty
            order1.items.append(
                OrderItem(product_id=product.id, quantity=qty,
                          unit_price=product.price, subtotal=subtotal)
            )
        order1.total_amount = sum(i.subtotal for i in order1.items)

        order2 = Order(customer_id=customers[1].id, status="confirmed")
        product, qty = products[3], 1
        product.quantity -= qty
        order2.items.append(
            OrderItem(product_id=product.id, quantity=qty,
                      unit_price=product.price, subtotal=product.price * qty)
        )
        order2.total_amount = sum(i.subtotal for i in order2.items)

        db.add_all([order1, order2])
        db.commit()

        print(f"Seeded {len(products)} products, {len(customers)} customers, 2 orders.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
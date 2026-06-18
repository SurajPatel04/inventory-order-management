from pydantic import BaseModel
from app.schemas.product import ProductRead
from app.schemas.order import OrderRead

class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_threshold: int
    low_stock_products: list[ProductRead]
    recent_orders: list[OrderRead]

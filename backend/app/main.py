from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.router import products, customers, orders, dashboard

app = FastAPI(
    title="Inventory & Order Management API",
    root_path="/api"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://inventory-pro.surajpatel.dev",
        "http://localhost:5173",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Inventory & Order Management API"}
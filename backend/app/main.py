from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.router import products, customers, orders

app = FastAPI(title="Inventory & Order Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Inventory & Order Management API"}
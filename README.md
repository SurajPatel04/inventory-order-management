# Inventory & Order Management System

A full-stack, production-ready Inventory and Order Management System built with FastAPI, React, and PostgreSQL. It features a modern, responsive UI with advanced filtering, robust backend validation, and automated inventory tracking.

## 🌐 Live Demo

- **Frontend Application**: [https://inventory-pro.surajpatel.dev/](https://inventory-pro.surajpatel.dev/)
- **Backend API Docs (Swagger)**: [https://inventory-pro.surajpatel.dev/api/docs](https://inventory-pro.surajpatel.dev/api/docs)

## 🚀 Technology Stack

- **Backend**: Python, FastAPI, SQLAlchemy, Alembic, Pydantic
- **Frontend**: React, Vite, TailwindCSS, Framer Motion, Recharts
- **Database**: PostgreSQL 15
- **Infrastructure**: Docker, Docker Compose, Nginx, GitHub Actions (CI/CD)

## 📡 API Endpoints

All backend routes are automatically proxied under the `/api/` path via Nginx in production.

### Dashboard
- `GET /api/dashboard/stats`: Retrieve aggregate metrics (Total products, customers, orders), low stock items, and recent orders.

### Products
- `GET /api/products`: Retrieve all products (supports pagination `skip`/`limit` and filters like `low_stock`).
- `POST /api/products`: Create a new product.
- `GET /api/products/{id}`: Retrieve a specific product.
- `PUT /api/products/{id}`: Update an existing product.
- `DELETE /api/products/{id}`: Delete a product.

### Customers
- `GET /api/customers`: Retrieve all customers (supports pagination and text search).
- `POST /api/customers`: Create a new customer.
- `GET /api/customers/{id}`: Retrieve a specific customer.
- `DELETE /api/customers/{id}`: Delete a customer.

### Orders
- `GET /api/orders`: Retrieve all orders (supports pagination and filtering).
- `POST /api/orders`: Place a new order (automatically validates and reduces stock inventory).
- `GET /api/orders/{id}`: Retrieve a specific order including nested product items.
- `PUT /api/orders/{id}/status`: Update the status of an order.
- `DELETE /api/orders/{id}`: Cancel an order (automatically restores stock inventory).

## ⚙️ Business Logic Implementation

The backend API strictly enforces all core business rules to maintain data integrity:

- **Unique Constraints**: Product SKUs and Customer Email addresses are guaranteed to be unique at the database level. Attempting to create duplicates results in a clean HTTP 400 error.
- **Data Validation**: Product quantities cannot be negative. Pydantic schemas validate all incoming JSON payloads before they hit the database.
- **Inventory Validation**: When an order is placed, the API explicitly checks if there is sufficient stock for each product. If stock is insufficient, the order is blocked entirely.
- **Atomic Stock Management**: Creating an order automatically reduces the available stock of the purchased products. Cancelling an order automatically restores the stock levels.
- **Automated Calculations**: The total order amount is automatically calculated by the backend by multiplying the product price by the ordered quantity, preventing frontend manipulation.
- **Robust Error Handling**: All endpoints use proper HTTP status codes (400, 404, 500) and return user-friendly error messages if business rules are violated.

## 🛠️ Running Locally (Docker Compose)

The entire application is fully containerized. You can spin up the Frontend, Backend, and PostgreSQL database with a single command.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd etharaAi_Assignment
   ```

2. **Set up Environment Variables**:
   Copy the example environment file and fill in your secure credentials:
   ```bash
   cp .env.example .env
   ```

3. **Start the Stack**:
   ```bash
   docker-compose up --build -d
   ```

4. **Seed Mock Data** (Optional):
   Populate the database with dummy customers, products, and orders:
   ```bash
   docker compose exec backend python -m app.seed
   ```

5. **Access Locally**:
   - Frontend Application: `http://localhost/`
   - Backend Swagger UI: `http://localhost/api/docs`

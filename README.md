# StockMate — Warehouse Inventory Management Platform

## 1. Project Overview
StockMate is a professional warehouse inventory management platform designed to help businesses manage stock, suppliers, warehouse operations, and product movement across multiple storage locations. It features a robust role-based security layer, real-time inventory ledger logging, procurement workflows, fulfillment tracking, versioned file directories, and multi-channel notifications.

## 2. Problem Statement
Create a warehouse inventory management platform that helps businesses efficiently manage stock, suppliers, warehouse operations, and product movement across multiple storage locations. StockMate satisfies these objectives by providing:
1. **Inventory Control**: Tracking stock levels, low-stock alerts, out-of-stock catalogs, and bin locations.
2. **Operations Flow**: Managing supplier interactions, warehouses hierarchy (warehouses, zones, bins), purchase orders, goods receipts, and sales orders.
3. **Product Movement Tracking**: Recording every transaction in an inventory ledger and providing detailed dashboard analytics.

## 3. Features
* **Role-Based Authentication**: Secure login and signup with permissions for `admin` and `manager` roles.
* **Warehouse Hierarchy Configuration**: Support for multiple warehouses containing temperature zones (`ambient`, `chilled`, `frozen`) and precise coordinate location bins.
* **Catalog Management**: Category classification hierarchies and unique SKU product catalogs.
* **Procurement Execution**: Purchase orders submission, review authorization flows, and automatic stock check-in upon Goods Receipt.
* **Fulfillment Operations**: Inventory reservations, pick list status workflow (`DRAFT` → `RELEASED` → `START` → `COMPLETED`), carton packaging validations, and cargo dispatch logs.
* **File Metadata Storage**: Virtual directory organization with file upload tracking, versions, and archive/restore commands.
* **History Logs & Alerts**: Message templates and preferences covering Email, SMS, and In-App notification channels.
* **Aggregated Dashboard Reports**: Real-time KPI summaries, top selling SKUs, and inventory report history.

## 4. Tech Stack
* **Runtime Platform**: Node.js (ES Modules)
* **Framework**: Express.js
* **Database**: MongoDB (Object Data Modeling via Mongoose)
* **Validation**: Joi Schema Validations
* **Security & Auth**: JWT (JSON Web Tokens), bcrypt (Password Hashing), cookie-parser

## 5. Folder Structure
```
StockMate/
├── .env.example
├── .gitignore
├── .prettierrc
├── README.md
├── package.json
├── server.js
└── src/
    ├── app.js
    ├── config/
    │   └── db.config.js
    ├── constant/
    │   └── validation.constant.js
    ├── controller/
    │   ├── analytics.controller.js
    │   ├── auth.controller.js
    │   ├── file.controller.js
    │   ├── fulfillment.controller.js
    │   ├── inventory.controller.js
    │   ├── notification.controller.js
    │   ├── product.controller.js
    │   ├── purchase.controller.js
    │   ├── sales.controller.js
    │   ├── supplier.controller.js
    │   └── warehouse.controller.js
    ├── db/
    │   └── dbConnection.js
    ├── error/
    │   └── api.error.js
    ├── middleware/
    │   ├── auth.middleware.js
    │   ├── checkUser.middleware.js
    │   └── errorHandler.middleware.js
    ├── model/
    │   ├── analytics.model.js
    │   ├── auth.model.js
    │   ├── file.model.js
    │   ├── fulfillment.model.js
    │   ├── inventory.model.js
    │   ├── notification.model.js
    │   ├── product.model.js
    │   ├── purchase.model.js
    │   ├── sales.model.js
    │   ├── supplier.model.js
    │   └── warehouse.model.js
    ├── router/
    │   ├── analytics.route.js
    │   ├── auth.route.js
    │   ├── file.route.js
    │   ├── fulfillment.route.js
    │   ├── inventory.route.js
    │   ├── notification.route.js
    │   ├── product.route.js
    │   ├── purchase.route.js
    │   ├── sales.route.js
    │   ├── supplier.route.js
    │   └── warehouse.route.js
    ├── util/
    │   └── asyncHandler.util.js
    └── validation/
        ├── analytics.validation.js
        ├── auth.validation.js
        ├── file.validation.js
        ├── fulfillment.validation.js
        ├── inventory.validation.js
        ├── notification.validation.js
        ├── product.validation.js
        ├── purchase.validation.js
        ├── sales.validation.js
        ├── supplier.validation.js
        └── warehouse.validation.js
```

## 6. Installation & Setup
1. **Clone the project**:
   ```bash
   git clone <repository-url>
   cd StockMate
   ```
2. **Install all dependencies**:
   ```bash
   npm install
   ```
3. **Configure the environment settings**:
   ```bash
   cp .env.example .env
   ```
4. **Verify MongoDB is active**:
   Ensure MongoDB instance is running locally on port `27017` (e.g. `brew services start mongodb-community`).

## 7. Environment Variables
* `PORT`: Server port (default: `4000`)
* `MONGODB_URI`: Local/Remote connection URI string
* `MONGODB_DB_NAME`: Database name (`stockmate`)
* `JWT_SECRET`: Security token signature key
* `JWT_EXPIRY`: Lifespan duration for sessions (e.g. `7d`)

## 8. Running the Project
To run the server locally:
```bash
node server.js
```
Console output will log database initialization and port registration:
`MongoDB Connected: HOST <127.0.0.1>`
`Server is UP and Running on PORT 4000`

## 9. API Overview
### Authentication
* `POST /api/auth/register` — Sign up new users.
* `POST /api/auth/login` — Log in user and receive cookie-based JWT.

### Suppliers
* `POST /api/suppliers` — Register a supplier profile.
* `GET /api/suppliers` — List all active supplier records.

### Warehouses
* `POST /api/warehouses` — Create a warehouse storage profile.
* `POST /api/warehouses/:id/zones` — Add a localized temperature-controlled zone.
* `POST /api/warehouses/locations/create` — Add a storage bin location.

### Products
* `POST /api/products/categories` — Register categories.
* `POST /api/products` — Register a catalog SKU line.

### Inventory
* `POST /api/inventory/in` — Check items into a location.
* `POST /api/inventory/out` — Dispatch items out.
* `POST /api/inventory/adjust` — Quantities balance adjustment.
* `POST /api/inventory/transfer` — Bin transfers relocation.

### Procurement
* `POST /api/purchase-orders` — Create a PO.
* `POST /api/purchase-orders/:id/submit` — Submit PO for review.
* `POST /api/purchase-orders/:id/approve` — Approve PO status.
* `POST /api/purchase-orders/:id/receive` — Receive PO lines (increases inventory).

### Customers & Sales
* `POST /api/sales/customers` — Create customer profiles.
* `POST /api/sales/orders` — Create Sales Orders (SO).
* `POST /api/sales/orders/:id/confirm` — Confirm SO (verifies and reduces inventory).

### Fulfillment
* `POST /api/fulfillment/reservations` — Reserve stock items.
* `POST /api/fulfillment/picklists` — Create pick lists.
* `POST /api/fulfillment/picklists/:id/complete` — Complete picking.
* `POST /api/fulfillment/packing` — Pack cartons.
* `POST /api/fulfillment/dispatch` — Dispatch cargo shipments.

### File Metadata
* `POST /api/files/folders` — Create directories.
* `POST /api/files` — Add file metadata.

### Notifications
* `POST /api/notifications/templates` — Register alert template.
* `POST /api/notifications/send` — Trigger notification dispatch.

### Reports & Analytics
* `GET /api/analytics/dashboard-summary` — Overall metrics counts.
* `GET /api/analytics/top-selling` — Top selling products.

## 10. Authentication Details
The backend utilizes JWT cookie-based session verification (`token` cookie). When a request hits a protected route, the `authMiddleware` decodes the token payload to check if the user is authenticated and active. For administrative operations, `allowedUser` checks the user role (`admin` or `manager`) against a configuration array, rejecting unauthorized attempts with a `403 Forbidden` status code.

## 11. Core Warehouse Workflow
```
Register User -> Login -> Register Supplier -> Create Warehouse -> Create Zone -> Create Location Bin -> Create Category -> Create Product -> Stock In -> Create Purchase Order -> Submit PO -> Approve PO -> Goods Receipt (Stock updates) -> Create Customer -> Create Sales Order -> Create Stock Reservation -> Confirm Sales Order (Stock deduction) -> Generate Pick List -> Complete Picking -> Pack Cartons -> Dispatch Shipment -> Generate Analytics Reports.
```

## 12. Authors
* **Rexy-5097** (Lead Developer)
* **uvee** (Collaborator)

## 13. Future Scope
* **Barcode Integration**: Support for automatic scanning inputs during picking and packing.
* **Optimized Routing Algorithms**: Dynamic path allocation to guide warehouse staff through the shortest picking layout paths.
* **Hardware Integrations**: IoT scale sensors reporting bin weights directly to the inventory balances.
* **Third-Party Logistics (3PL)**: Automatic carrier integration to purchase shipment shipping labels directly upon order dispatch.

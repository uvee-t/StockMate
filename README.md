# StockMate — Warehouse Inventory Management Platform

StockMate is a backend warehouse inventory management platform that helps businesses efficiently manage stock, suppliers, warehouse operations, and product movement across multiple storage locations.

The platform provides role-based authentication, real-time inventory engine ledger logs, procurement flows, sales orders tracking, execution picking lists, notification alerts, versioned file metadata configurations, and comprehensive dashboard analytics.

---

## 1. Objectives

1. **Manage inventory and stock levels** across multiple locations/bins.
2. **Track supplier and warehouse operations** through Purchase Orders and Sales Orders.
3. **Monitor product movement and reports** through an Inventory Ledger and dynamic aggregations.

---

## 2. Tech Stack

* **Runtime Environment**: Node.js (ES Modules)
* **Web Framework**: Express.js
* **Database**: MongoDB (Object Data Modeling via Mongoose)
* **Input Validation**: Joi
* **Security & Auth**: JWT (JSON Web Tokens), bcrypt (Password Hashing), cookie-parser

---

## 3. Features

* **Authentication & Authorization**: Secure signup, login, and JWT verify flow via cookies with role-based restriction layers (`admin` and `manager`).
* **Supplier & Customer Profiles**: Full CRUD controls for managing suppliers and customers.
* **Warehouse Zone Hierarchy**: Define warehouses, nested temperature-controlled zones (`ambient`, `chilled`, `frozen`), and specific layout location bins.
* **Product Catalog**: Manage categories and items with unique SKU constraints and pricing models.
* **Inventory Engine**: Real-time direct stock in, stock out, relocations between locations (transfers), and balance adjustments.
* **Procurement Workflow**: Purchase Orders creation, submission approval flow, and automatic inventory check-in during Goods Receipt.
* **Fulfillment Execution**: Reserve items, generate pick lists, execute status picking cycles (`DRAFT` → `RELEASED` → `START` → `COMPLETED`), pack cartons, and dispatch shipments.
* **File Storage Directory**: Organize metadata folders, track file version uploads, and support archive/restore.
* **Notification History**: Notification templates and multi-channel preferences (Email, SMS, In-App).
* **Analytics Reports**: Dashboard summary counts, top-selling lines, stock reports, and custom query history.

---

## 4. Folder Structure

```
StockMate/
├── .env.example
├── .gitignore
├── .prettierrc
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

---

## 5. Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd StockMate
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment variables**:
   Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. **Verify MongoDB is running**:
   Ensure MongoDB instance is active on port `27017` (e.g. `brew services start mongodb-community`).

---

## 6. Running the Project

* **Start the server**:
  ```bash
  node server.js
  ```
  *(Output confirms database connection and active port)*:
  `MongoDB Connected: HOST <127.0.0.1>`
  `Server is UP and Running on PORT 4000`

---

## 7. API Summary

### Authentication
* `POST /api/auth/register` — User signup (roles: `admin`, `manager`)
* `POST /api/auth/login` — User authentication, returns cookie JWT

### Supplier Profile
* `POST /api/suppliers` — Register supplier
* `GET /api/suppliers` — List all suppliers

### Warehouse & Locations
* `POST /api/warehouses` — Create warehouse
* `POST /api/warehouses/:id/zones` — Add zone
* `POST /api/warehouses/locations/create` — Add location bin

### Product Catalog
* `POST /api/products/categories` — Register product category
* `POST /api/products` — Register product details

### Inventory Ledger
* `POST /api/inventory/in` — Check stock in
* `POST /api/inventory/out` — Stock dispatch
* `POST /api/inventory/adjust` — Inventory quantity correction
* `POST /api/inventory/transfer` — Relocate items between locations

### Procurement
* `POST /api/purchase-orders` — Create PO
* `POST /api/purchase-orders/:id/submit` — Submit PO for review
* `POST /api/purchase-orders/:id/approve` — Approve PO
* `POST /api/purchase-orders/:id/receive` — Goods receipt (updates stock)

### Sales Orders & Fulfillment
* `POST /api/sales/customers` — Create customer profile
* `POST /api/sales/orders` — Create SO
* `POST /api/fulfillment/reservations` — Reserve stock for order
* `POST /api/sales/orders/:id/confirm` — Confirm SO (reduces stock)
* `POST /api/fulfillment/picklists` — Create pick list task
* `POST /api/fulfillment/picklists/:id/release` — Release pick list
* `POST /api/fulfillment/picklists/:id/start` — Start picking
* `POST /api/fulfillment/picklists/:id/complete` — Complete picking
* `POST /api/fulfillment/packing` — Packing verification
* `POST /api/fulfillment/dispatch` — Cargo dispatch shipment

### File Service
* `POST /api/files/folders` — Create folder
* `POST /api/files` — Add file metadata
* `POST /api/files/:id/versions` — Upload version

### Notification Alerts
* `POST /api/notifications/templates` — Create message template
* `POST /api/notifications/send` — Direct dispatch log

### Analytics
* `GET /api/analytics/dashboard-summary` — Real-time counts
* `GET /api/analytics/top-selling` — Retrieve top selling SKUs

---

## 8. Authors

* **Lead Developer / Architect**: Rexy-5097
* **Collaborator**: uvee

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">🚀 SaaS Subscription Management System</h1>

<p align="center">
  <strong>A Production-Ready Multi-Tenant Subscription & Billing Platform</strong>
</p>

<p align="center">
  Built with <a href="http://nestjs.com/" target="blank">NestJS</a>, <a href="https://www.postgresql.org/" target="blank">PostgreSQL</a>, and <a href="https://www.prisma.io/" target="blank">Prisma ORM</a>
</p>

<p align="center">
  <a href="https://saas-subscription-management-system-production.up.railway.app/api/docs" target="_blank">
    <img src="https://img.shields.io/badge/🚀%20Live-Demo-brightgreen?style=for-the-badge&logo=railway" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <a href="https://nestjs.com/" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://opensource.org/licenses/MIT" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="#" target="_blank"><img src="https://img.shields.io/github/actions/workflow/status/nestjs/nest/ci.yml?branch=master" alt="CI" /></a>
</p>

---

## 📸 Previews

### 🌐 Live Demo & API Endpoint
🔗 **API Documentation:** [Access Swagger UI](https://saas-subscription-management-system-production.up.railway.app/api/docs)

### 🖼️ System Screenshots

#### 1. Swagger API Documentation
![Swagger API Docs](./images/docs/swagger-ui.png)

#### 2. Platform Overview
![Platform Overview](./images/docs/platform-preview.png)

#### 3. Prisma Studio Database Dashboard
![Prisma Studio Dashboard](./images/docs/prisma-studio.png)

#### 4. Prisma Studio Customer Database Dashboard
![Prisma Studio Dashboard](./images/docs/prisma-studio1.png)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Accounting Logic](#-accounting-logic)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Overview

**SaaS Subscription Management System** is a complete backend solution designed to manage multi-tenant subscription businesses. It handles everything from customer onboarding to subscription billing, payment processing, and accounting with double-entry bookkeeping.

### 🎯 Use Cases
- SaaS Platforms managing multiple companies.
- Subscription-based services.
- Recurring billing systems.
- Financial reporting and accounting.

### 🔑 Key Benefits
- ✅ **Multi-Tenant Isolation** - Complete data separation between companies.
- ✅ **Automated Billing** - Generate invoices for active subscriptions.
- ✅ **Accounting Ready** - Double-entry bookkeeping with deferred revenue.
- ✅ **Production Ready** - Comprehensive testing and security.

---

## ✨ Features

### 🏢 Multi-Tenancy
| Feature | Description |
| :--- | :--- |
| **Tenant Registration** | Companies can self-register with admin user creation |
| **Data Isolation** | Complete data separation between tenants |
| **Default Chart of Accounts** | Pre-configured accounting setups for every new tenant |

### 👥 Customer & Subscription Management
| Feature | Description |
| :--- | :--- |
| **Subscription Plans** | Create, update, delete plans (Bronze, Silver, Gold) |
| **Customers** | Full CRUD operations with tax ID support |
| **Subscriptions** | Link customers to plans with start/end dates |

### 💳 Invoicing & Payments
| Feature | Description |
| :--- | :--- |
| **Automated Invoicing** | Generate monthly invoices for all active subscriptions |
| **Payment Processing** | Record payments against invoices |
| **Invoice Status Tracking** | DRAFT → SENT → PAID workflow |

### 📊 Accounting (Double-Entry)
| Feature | Description |
| :--- | :--- |
| **Chart of Accounts** | Cash, Accounts Receivable, Deferred Revenue, Revenue |
| **Journal Entries** | Every financial transaction is automatically logged |
| **Revenue Recognition** | Monthly recognition flow converting deferred revenue to earned revenue |
| **Financial Reports** | Balance Sheet & Income Statement generation |

### 🔐 Security & Testing
| Feature | Description |
| :--- | :--- |
| **JWT Authentication** | Secure API access with token-based authentication |
| **Role-Based Access** | Hierarchical Admin and Staff roles |
| **Unit Tests** | Comprehensive test suites covering core services |
| **E2E Tests** | End-to-end tests covering full application workflows |

---

## 🛠️ Tech Stack

| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | v18+ | JavaScript runtime |
| **Framework** | NestJS | v11 | Backend framework |
| **Database** | PostgreSQL | v14+ | Primary database |
| **ORM** | Prisma | v5.22 | Database ORM |
| **Auth** | JWT + Passport | - | Authentication |
| **Hashing** | bcrypt | v6 | Password hashing |
| **Validation** | class-validator | v0.15 | Request validation |
| **Testing** | Jest + Supertest | v30 | Testing framework |
| **Language** | TypeScript | v5.7 | Programming language |

---

## 🗄️ Database Schema

### Current Data Statistics (Prisma Studio)

| Model | Records | Description |
| :--- | :---: | :--- |
| **Account** | 4 | Chart of Accounts |
| **Customer** | 8 | Customers per tenant |
| **Invoice** | 3 | Invoices generated |
| **JournalEntry** | 5 | Accounting entries |
| **JournalLine** | 10 | Entry lines (Debit/Credit) |
| **Payment** | 1 | Payments processed |
| **Subscription** | 7 | Active subscriptions |
| **SubscriptionPlan** | 7 | Available plans |
| **Tenant** | 15 | Registered companies |
| **User** | 15 | System users |

### Database ERD

```text
┌─────────────────────────────────────────────────────────────┐
│ Tenant                                                      │
│ id │ name │ email │ phone │ address                         │
└─────────────────────────────────────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ User            │ │ Customer        │ │SubscriptionPlan │
│ id    │ email   │ │ id    │ name    │ │ id    │ name    │
│ role  │ tenantId│ │ email │ tenantId│ │ price │ tenantId│
└─────────────────┘ └─────────────────┘ └─────────────────┘
                               │
                       └───────┬───────┘
                               ▼
                      ┌──────────────────┐
                      │ Subscription     │
                      │ id   │ customerId│
                      │ planId │ status  │
                      └──────────────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │ Invoice          │
                      │ id     │ amount  │
                      │ status │ tenantId│
                      └──────────────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │ Payment          │
                      │ id     │ amount  │
                      │ method │ tenantId│
                      └──────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Accounting Models                                           │
├─────────────────────────────────────────────────────────────┤
│ Account (Chart of Accounts)                                 │
│ id │ code │ name │ type (ASSET/LIABILITY/REVENUE)           │
├─────────────────────────────────────────────────────────────┤
│ JournalEntry                                                │
│ id │ description │ reference │ tenantId                     │
├─────────────────────────────────────────────────────────────┤
│ JournalLine                                                 │
│ id │ type (DEBIT/CREDIT) │ amount │ journalEntryId          │
│ accountId                                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** v18 or higher
- **PostgreSQL** v14 or higher
- **npm** or **yarn** package manager

### 1️⃣ Clone the Repository

```bash
git clone [https://github.com/username/saas-subscription-management.git](https://github.com/username/saas-subscription-management.git)
cd saas-subscription-management
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

# JWT Configuration
JWT_SECRET="change-this-to-a-secure-random-secret-key-in-production"
JWT_EXPIRES_IN="7d"
```

### 4️⃣ Setup Database

```bash
# Create database (if it doesn't exist)
psql -U postgres -c "CREATE DATABASE subscription_management;"

# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed database with sample data
npm run seed
```

### 5️⃣ Start the Application

```bash
# Development mode (with auto-reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API server will be running at: **http://localhost:3000**

---

## 📚 API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
| :---: | :--- | :--- | :---: |
| `POST` | `/auth/register` | Register a new tenant | ❌ |
| `POST` | `/auth/login` | Login with credentials | ❌ |

<details>
<summary><b>📝 Register Request/Response</b></summary>

**Request:**
```json
POST /auth/register
{
  "name": "Sample Tenant",
  "email": "admin@tenant.com",
  "password": "SecurePassword123",
  "phone": "+1234567890",
  "address": "123 Business St"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "tenant-user-uuid-placeholder",
    "name": "Sample Tenant",
    "email": "admin@tenant.com",
    "role": "ADMIN",
    "tenantId": "tenant-uuid-placeholder"
  }
}
```
</details>

<details>
<summary><b>📝 Login Request/Response</b></summary>

**Request:**
```json
POST /auth/login
{
  "email": "admin@tenant.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "tenant-user-uuid-placeholder",
    "name": "Sample Tenant",
    "email": "admin@tenant.com",
    "role": "ADMIN",
    "tenantId": "tenant-uuid-placeholder"
  }
}
```
</details>

---

### 👥 Customer Endpoints

| Method | Endpoint | Description | Auth Required |
| :---: | :--- | :--- | :---: |
| `POST` | `/customers` | Create a customer | ✅ |
| `GET` | `/customers` | Get all customers | ✅ |
| `GET` | `/customers/:id` | Get customer by ID | ✅ |
| `PUT` | `/customers/:id` | Update customer | ✅ |
| `DELETE` | `/customers/:id` | Delete customer | ✅ |

<details>
<summary><b>📝 Create Customer Request/Response</b></summary>

**Request:**
```json
POST /customers
Authorization: Bearer <token>
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+123456789",
  "address": "456 Customer Ave",
  "taxId": "TAX-123"
}
```

**Response (201 Created):**
```json
{
  "id": "customer-uuid-placeholder",
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+123456789",
  "address": "456 Customer Ave",
  "taxId": "TAX-123",
  "tenantId": "tenant-uuid-placeholder",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```
</details>

---

### 📊 Subscription Plan Endpoints

| Method | Endpoint | Description | Auth Required |
| :---: | :--- | :--- | :---: |
| `POST` | `/plans` | Create a plan | ✅ |
| `GET` | `/plans` | Get all plans | ✅ |
| `GET` | `/plans/:id` | Get plan by ID | ✅ |
| `PUT` | `/plans/:id` | Update plan | ✅ |
| `DELETE` | `/plans/:id` | Delete plan | ✅ |

<details>
<summary><b>📝 Create Plan Request/Response</b></summary>

**Request:**
```json
POST /plans
Authorization: Bearer <token>
{
  "name": "Bronze Plan",
  "description": "Basic plan for small businesses",
  "price": 100,
  "currency": "USD",
  "billingCycle": "MONTHLY"
}
```

**Response (201 Created):**
```json
{
  "id": "plan-uuid-placeholder",
  "name": "Bronze Plan",
  "description": "Basic plan for small businesses",
  "price": 100,
  "currency": "USD",
  "billingCycle": "MONTHLY",
  "isActive": true,
  "tenantId": "tenant-uuid-placeholder",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```
</details>

---

### 🔄 Subscription Endpoints

| Method | Endpoint | Description | Auth Required |
| :---: | :--- | :--- | :---: |
| `POST` | `/subscriptions` | Create a subscription | ✅ |
| `GET` | `/subscriptions` | Get all subscriptions | ✅ |
| `GET` | `/subscriptions/active` | Get active subscriptions | ✅ |
| `GET` | `/subscriptions/:id` | Get subscription by ID | ✅ |
| `PUT` | `/subscriptions/:id` | Update subscription | ✅ |
| `PATCH` | `/subscriptions/:id/cancel` | Cancel subscription | ✅ |
| `DELETE` | `/subscriptions/:id` | Delete subscription | ✅ |

<details>
<summary><b>📝 Create Subscription Request/Response</b></summary>

**Request:**
```json
POST /subscriptions
Authorization: Bearer <token>
{
  "customerId": "customer-uuid-placeholder",
  "planId": "plan-uuid-placeholder",
  "startDate": "2026-01-01T00:00:00Z",
  "autoRenew": true
}
```

**Response (201 Created):**
```json
{
  "id": "subscription-uuid-placeholder",
  "customerId": "customer-uuid-placeholder",
  "planId": "plan-uuid-placeholder",
  "startDate": "2026-01-01T00:00:00.000Z",
  "endDate": "2026-02-01T00:00:00.000Z",
  "status": "ACTIVE",
  "autoRenew": true,
  "tenantId": "tenant-uuid-placeholder"
}
```
</details>

---

### 📄 Invoice Endpoints

| Method | Endpoint | Description | Auth Required |
| :---: | :--- | :--- | :---: |
| `POST` | `/invoices` | Create an invoice | ✅ |
| `GET` | `/invoices` | Get all invoices | ✅ |
| `GET` | `/invoices/:id` | Get invoice by ID | ✅ |
| `PUT` | `/invoices/:id` | Update invoice | ✅ |
| `POST` | `/invoices/generate-monthly` | Generate monthly invoices | ✅ |
| `PATCH` | `/invoices/:id/sent` | Mark invoice as sent | ✅ |

<details>
<summary><b>📝 Create Invoice Request/Response</b></summary>

**Request:**
```json
POST /invoices
Authorization: Bearer <token>
{
  "subscriptionId": "subscription-uuid-placeholder",
  "amount": 100,
  "tax": 0
}
```

**Response (201 Created):**
```json
{
  "id": "invoice-uuid-placeholder",
  "invoiceNumber": "INV-100001",
  "amount": 100,
  "tax": 0,
  "totalAmount": 100,
  "currency": "USD",
  "status": "DRAFT",
  "invoiceDate": "2026-01-01T00:00:00.000Z",
  "dueDate": "2026-02-01T00:00:00.000Z"
}
```
</details>

---

### 💳 Payment Endpoints

| Method | Endpoint | Description | Auth Required |
| :---: | :--- | :--- | :---: |
| `POST` | `/payments` | Create a payment | ✅ |
| `GET` | `/payments` | Get all payments | ✅ |
| `GET` | `/payments/:id` | Get payment by ID | ✅ |

<details>
<summary><b>📝 Create Payment Request/Response</b></summary>

**Request:**
```json
POST /payments
Authorization: Bearer <token>
{
  "invoiceId": "invoice-uuid-placeholder",
  "amount": 100,
  "method": "CASH",
  "reference": "PAY-001"
}
```

**Response (201 Created):**
```json
{
  "id": "payment-uuid-placeholder",
  "amount": 100,
  "currency": "USD",
  "paymentDate": "2026-01-01T00:00:00.000Z",
  "method": "CASH",
  "reference": "PAY-001",
  "status": "COMPLETED"
}
```
</details>

---

### 📊 Accounting Endpoints

| Method | Endpoint | Description | Auth Required |
| :---: | :--- | :--- | :---: |
| `GET` | `/accounting/journal-entries` | Get all journal entries | ✅ |
| `GET` | `/accounting/balance-sheet` | Get balance sheet | ✅ |
| `GET` | `/accounting/income-statement` | Get income statement | ✅ |
| `POST` | `/accounting/recognize-revenue` | Recognize deferred revenue | ✅ |

<details>
<summary><b>📊 Balance Sheet Response</b></summary>

```json
GET /accounting/balance-sheet
Authorization: Bearer <token>

{
  "assets": {
    "total": 850,
    "items": [
      { "id": "account-1", "code": "1000", "name": "Cash", "balance": 500 },
      { "id": "account-2", "code": "1100", "name": "Accounts Receivable", "balance": 350 }
    ]
  },
  "liabilities": {
    "total": 0,
    "items": [
      { "id": "account-3", "code": "2000", "name": "Deferred Revenue", "balance": 0 }
    ]
  },
  "revenue": {
    "total": 850,
    "items": [
      { "id": "account-4", "code": "4000", "name": "Subscription Revenue", "balance": 850 }
    ]
  }
}
```
</details>

---

## 📊 Accounting Logic

### 🧾 Chart of Accounts

| Code | Account Name | Type | Normal Balance |
| :---: | :--- | :--- | :---: |
| 1000 | Cash | ASSET | Debit |
| 1100 | Accounts Receivable | ASSET | Debit |
| 2000 | Deferred Revenue | LIABILITY | Credit |
| 4000 | Subscription Revenue | REVENUE | Credit |

### 📝 Double-Entry Bookkeeping

Every financial transaction is recorded using double-entry bookkeeping:

| Transaction | Debit (DR) | Credit (CR) | Explanation |
| :--- | :--- | :--- | :--- |
| **Invoice Created** | Accounts Receivable (1100) | Deferred Revenue (2000) | Revenue is not earned yet |
| **Payment Received** | Cash (1000) | Accounts Receivable (1100) | Customer pays invoice |
| **Revenue Recognition** | Deferred Revenue (2000) | Subscription Revenue (4000) | Revenue is now earned |

---

## 🧪 Testing

### Run Tests

```bash
# Run all unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:cov
```

---

## 🚀 Deployment

### Deploy to Railway (Recommended)

1. **Push code to GitHub:**
   ```bash
   git push origin main
   ```
2. **Deploy via Railway Dashboard:**
   - Connect repository and map environment variables.

### Environment Variables Checklist

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | ✅ | JWT signing secret | `your-secret-key` |
| `JWT_EXPIRES_IN` | ✅ | Token expiration | `7d` |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@Islam Hamdy](https://github.com/islam412)
- LinkedIn: [@Islam Hamdy](https://www.linkedin.com/in/islam-hamdy-62a94826b/)

---

**⭐ Star this repository if you find it useful!**

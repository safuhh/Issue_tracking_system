# IssueTrackr — Issue Tracking & Developer Coordination System

A full-stack, enterprise-grade issue tracking and task coordination platform built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **Redux Toolkit**, **Node.js**, **Express**, and **MongoDB (Mongoose)**.

---

## 📚 Project Documentation

The repository documentation is modularly divided across four dedicated documents:

| Document | Focus & Content |
| :--- | :--- |
| 📋 **[Business Requirements Document (BRD)](./brd.md)** | Business objectives, user roles, functional/non-functional requirements, system architecture, database ERD, deployment plan, and acceptance criteria. |
| ⚙️ **[Backend Documentation (`backend/README.md`)](./backend/README.md)** | Express + TypeScript MVC architecture, Mongoose database models, complete REST API reference, environment variables, admin seeding, and Render deployment. |
| 💻 **[Frontend Documentation (`frontend/README.md`)](./frontend/README.md)** | React 18 + Vite architecture, feature modules, Redux state slices, Axios silent token refresh, modular issue services, client routing, and Vercel deployment. |

---

## 🚀 Tech Stack Summary

| Tier | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite v5, TypeScript | Single Page Application (SPA) with fast Hot Module Replacement |
| **Styling** | Tailwind CSS v4, PostCSS | Modern, responsive component styling |
| **State Management** | Redux Toolkit, React-Redux | Centralized authentication session and UI state |
| **Client Routing** | React Router DOM v7 | Role-based protected routes (`ProtectedRoute`) |
| **HTTP Client** | Axios v1.20 | Dual-token request interceptor and silent refresh queue |
| **Backend API** | Node.js (v18+), Express v4, TypeScript | Modular MVC REST API with route-level validation |
| **Database & ODM** | MongoDB, Mongoose v8 | Document database with schema typing and indexes |
| **Authentication** | JWT, bcryptjs, cookie-parser | Access token in memory + HttpOnly refresh token cookie |
| **Input Validation** | Joi v18 | Schema validation middleware for request payloads |

---

## ✨ Key Features

- **Role-Based Access Control (RBAC):** Distinct interfaces, routes, and authorization rules for `user`, `developer`, and `admin`.
- **Dual-Token Authentication Lifecycle:**
  - Short-lived access token stored in memory (15-minute lifespan).
  - Refresh token stored securely in an `HttpOnly`, `SameSite` browser cookie (7-day lifespan).
  - Axios response interceptor silently refreshes expired access tokens without user interruption.
- **User Issue Intake & Tracking:** Submit defect reports with priority levels (`low`, `medium`, `high`, `critical`), track personal ticket statuses, edit/delete pending tickets, and view developer progress notes.
- **Developer Workspace (`/dev`):** View tickets assigned specifically to the logged-in engineer, transition status (`pending` &rarr; `in-progress` &rarr; `closed`), and publish technical progress comments.
- **Executive Admin Governance (`/admin`):** Real-time summary metrics (Total, Pending, In-Progress, Closed), global ticket triage, developer assignment, and user management (create, update roles, delete).
- **Real-Time Event Stream:** Server-Sent Events (SSE) route (`GET /api/issues/stream`) broadcasting status and assignment updates.

---

## 📁 Repository Structure

```
man/
├── brd.md                      # Comprehensive Business Requirements Document
├── README.md                   # Workspace entry point & quickstart
├── backend/                    # Node.js + Express + TypeScript REST API
│   ├── README.md               # Backend technical documentation & API reference
│   ├── .env.example            # Environment variables template
│   ├── package.json            # Server dependencies & scripts
│   ├── tsconfig.json           # TypeScript configuration
│   ├── dist/                   # Production compiled JavaScript
│   └── src/
│       ├── config/             # Database connection (connectDB)
│       ├── controllers/        # Request controllers (auth, users, issues)
│       ├── middlewares/        # Auth, role guard (RBAC), and validation
│       ├── models/             # Mongoose models (User, Issue)
│       ├── routes/             # Express route declarations
│       ├── scripts/            # Admin account seeder (create-admin.ts)
│       ├── validators/         # Joi validation schemas
│       └── server.ts           # Server bootstrap & error handling
└── frontend/                   # React 18 + Vite + TypeScript Application
    ├── README.md               # Frontend architecture & service documentation
    ├── index.html              # HTML document root
    ├── vercel.json             # Vercel SPA routing rewrite rule
    ├── package.json            # Client dependencies & scripts
    ├── vite.config.ts          # Vite configuration & dev proxy
    ├── tsconfig.json           # TypeScript configuration
    ├── dist/                   # Production bundled static assets
    └── src/
        ├── App.tsx             # Routes & role-guarded ProtectedRoute
        ├── main.tsx            # React root mount with Redux & AuthProvider
        ├── index.css           # Tailwind CSS v4 entrypoint
        ├── features/           # Feature-sliced modules (admin, auth, dev, issues)
        ├── shared/             # Shared components (Navbar) & Axios client (api.ts)
        └── store/              # Redux Toolkit store configuration
```

---

## ⚡ Quick Start: Running Locally (From Repository Root)

Run the full stack locally from the repository root in four steps:

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher) & **npm** (v9.0.0 or higher)
- **MongoDB** running locally (`mongodb://localhost:27017/issue_tracker`) or a remote **MongoDB Atlas** cluster URI

### 2. Install Dependencies
```bash
npm install --prefix backend && npm install --prefix frontend
```

### 3. Configure Environment Variables
```bash
cp backend/.env.example backend/.env
```
*(Optionally adjust `backend/.env` with your MongoDB URI or JWT secrets).*

### 4. Seed Admin Account & Start Servers
```bash
# Seed initial admin account (admin@issuetrackr.com / AdminPassword123!)
npm run create-admin --prefix backend

# Start both servers (in separate terminals or background):
npm run dev --prefix backend    # Backend API: http://localhost:5001
npm run dev --prefix frontend   # Frontend Web App: http://localhost:3000
```

Open **`http://localhost:3000`** in your browser.

---

## 🧪 Verification & Production Builds (From Repository Root)

```bash
# Type check both codebases
(cd backend && npx tsc --noEmit)
(cd frontend && npx tsc --noEmit)

# Build both applications for production
npm run build --prefix backend
npm run build --prefix frontend

# Run production preview
npm start --prefix backend            # Runs node backend/dist/server.js
npm run preview --prefix frontend     # Serves frontend/dist locally
```

---

## 🚢 Deployment Architecture

| Tier | Target Platform | Build Command | Output / Start | Configuration |
| :--- | :--- | :--- | :--- | :--- |
| **Backend API** | **Render** (Web Service) | `npm install && npm run build` | `npm start` | Root: `backend`, Environment: `Node`, Node 18+ |
| **Frontend App** | **Vercel** (Edge CDN) | `npm run build` | `dist` | Root: `frontend`, Framework: `Vite`, `vercel.json` |
| **Database** | **MongoDB Atlas** | - | M0/M10 Cluster | Whitelist Render IP or `0.0.0.0/0` |

*For detailed, step-by-step deployment instructions:*
- Backend deployment on Render: See [`backend/README.md`](./backend/README.md#-production-deployment-on-render)
- Frontend deployment on Vercel: See [`frontend/README.md`](./frontend/README.md#-production-deployment-on-vercel)

---

## 🌐 Application URLs

| Service | Environment | URL | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Production** | Public (Vercel) | `https://issue-tracking-system-ten.vercel.app` | 🟢 Active |
| **Frontend Web App** | Local Development | `http://localhost:3000` | 🟢 Active |
| **Backend REST API** | Local Development | `http://localhost:5001/api` | 🟢 Active |
| **Backend Production** | Public (Render) | `Pending` | ⏳ Pending public deployment |

---

## 📖 Detailed Guides

- For complete functional specifications, user stories, and acceptance matrices &rarr; **[`brd.md`](./brd.md)**
- For backend models, schema specifications, and all REST endpoints &rarr; **[`backend/README.md`](./backend/README.md)**
- For frontend components, modular issue services, and state architecture &rarr; **[`frontend/README.md`](./frontend/README.md)**

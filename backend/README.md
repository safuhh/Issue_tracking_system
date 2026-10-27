# IssueTrackr — Backend REST API

RESTful API backend for **IssueTrackr**, built with **Node.js**, **Express**, **TypeScript**, **MongoDB / Mongoose**, **JSON Web Tokens (JWT)**, and **Joi validation**.

---

## 🚀 Tech Stack

- **Runtime & Language:** Node.js (v18+), TypeScript (v5+)
- **Web Framework:** Express v4 with MVC architecture
- **Database & ODM:** MongoDB, Mongoose v8
- **Authentication:** Dual-token JWT (HMAC-SHA256) with `jsonwebtoken`
- **Security:** `bcryptjs` (password hashing, 12 rounds), `cookie-parser` (HttpOnly cookies), `cors` (credentialed origins)
- **Validation:** Joi v18 schema validator middleware
- **Development Tooling:** `nodemon`, `tsx`, `ts-node`

---

## 🏛️ Architecture & Design Pattern

The backend follows the **Model-View-Controller (MVC)** architectural pattern in TypeScript, optimized for high security and maintainability:

```
Request ──► CORS & CookieParser ──► Joi Validator ──► Auth Middleware ──► Role Guard ──► Controller ──► Mongoose Model ──► MongoDB
                                                                                              │
                                         JSON Response ◄──────────────────────────────────────┘
```

- **Models (`src/models/`):** Strongly-typed Mongoose schemas enforcing constraints, unique indexes, and defaults (`User`, `Issue`).
- **Controllers (`src/controllers/`):** Pure request-response handlers separated by domain:
  - `auth.controller.ts`: Registration, bcrypt login, dual-token rotation, and logout.
  - `issues/`: Modular CRUD, assignment, comment thread, and status controllers.
  - `users/`: Executive admin dashboard, developer portal metrics, and user CRUD.
- **Routes (`src/routes/`):** Express routers mapping HTTP verbs to middleware pipelines (`auth.routes.ts`, `user.routes.ts`, `issue.routes.ts`).
- **Middlewares (`src/middlewares/`):**
  - `auth.middleware.ts`: Verifies `Bearer` access tokens and enforces RBAC roles (`authorize('admin')`, `authorize('developer', 'admin')`).
  - `validate.middleware.ts`: Intercepts and validates request bodies using Joi schemas.
- **Validators (`src/validators/`):** Centralized Joi schemas ensuring input sanitization before controllers execute.

## 📁 Folder Structure

```
backend/
├── .env.example            # Environment variables template
├── package.json            # Scripts & dependencies
├── tsconfig.json           # TypeScript configuration
├── dist/                   # Production compiled output
└── src/
    ├── config/             # Database connection (connectDB)
    ├── controllers/        # Request controllers
    │   ├── auth.controller.ts
    │   ├── issues/         # issue.crud, issue.assignment, issue.comment, issue.status
    │   └── users/          # admin.dashboard, developer.dashboard, user.management
    ├── middlewares/        # authenticate, authorize, validate
    ├── models/             # User and Issue Mongoose schemas
    ├── routes/             # Express routes (auth.routes, user.routes, issue.routes)
    ├── scripts/            # Database seeder (create-admin.ts)
    ├── validators/         # Joi validation schemas
    └── server.ts           # Server bootstrap & error handling
```

---

## 🗄️ Database Models

### 1. User Model (`src/models/user.model.ts`)
| Field | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Auto PK | Auto | Unique document ID |
| `name` | `String` | Trimmed, 2-50 chars | - | Full name |
| `email` | `String` | Unique, lowercase, trimmed | - | Login email (Indexed) |
| `password` | `String` | `select: false` | - | Salted bcrypt hash (12 salt rounds) |
| `role` | `String` | Enum: `['user', 'developer', 'admin']` | `'user'` | Role-based authorization tier |
| `refreshToken` | `String` | `select: false` | `null` | Active refresh token string |
| `previousRefreshToken`| `String` | `select: false` | `null` | Grace period refresh token |
| `createdBy` | `ObjectId` | Ref: `User` | `null` | Creator admin account |
| `createdAt` | `Date` | Timestamp | `now` | Account creation date |
| `updatedAt` | `Date` | Timestamp | `now` | Account last modified date |

### 2. Issue Model (`src/models/issue.model.ts`)
| Field | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Auto PK | Auto | Unique issue ID |
| `title` | `String` | Required, 3-120 chars | - | Summary headline of the bug |
| `description` | `String` | Required, 5-2000 chars | - | Detailed reproduction steps |
| `status` | `String` | Enum: `['pending', 'in-progress', 'closed']` | `'pending'` | Current issue stage (Indexed) |
| `priority` | `String` | Enum: `['low', 'medium', 'high', 'critical']` | `'medium'` | Issue priority rating |
| `submittedBy` | `ObjectId` | Required, Ref: `User` | - | Submitter account reference (Indexed) |
| `assignedTo` | `ObjectId` | Ref: `User`, Optional | `null` | Assigned engineer reference (Indexed) |
| `comments` | `Comment[]`| Subdocument array | `[]` | Embedded progress notes |
| `createdAt` | `Date` | Timestamp | `now` | Issue creation date |
| `updatedAt` | `Date` | Timestamp | `now` | Issue last modified date |

### 3. Comment Subdocument Schema
Embedded inside `Issue.comments`:
- `_id`: `ObjectId` (Auto PK)
- `content`: `String` (Required, 1-1500 chars)
- `author`: `ObjectId` (Required, Ref: `User`)
- `createdAt`: `Date` (Default: `Date.now`)

---

## 📡 REST API Reference

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <access_token>`.

### Authentication (`/api/auth`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Sign in & receive access token + refresh cookie |
| `POST` | `/api/auth/refresh-token` | Public (Cookie) | Silently refresh access token via HttpOnly cookie |
| `POST` | `/api/auth/logout` | Public | Invalidate refresh token and clear cookie |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |

### User Management (`/api/users`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Authenticated | Fetch current user profile (`getMe`) |
| `GET` | `/api/users/admin` | Admin Only | Get admin stats, recent users, and issues |
| `GET` | `/api/users/dev` | Dev & Admin | Get developer metrics and active issues |
| `POST` | `/api/users` | Admin Only | Create user account with explicit role |
| `PUT` | `/api/users/:id` | Admin Only | Full update of user account by ID |
| `PATCH` | `/api/users/:id` | Admin Only | Partial update of user account by ID |
| `DELETE` | `/api/users/:id` | Admin Only | Permanently delete a user account |

### Issue Management (`/api/issues`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/issues` | Authenticated | Submit a new issue ticket |
| `GET` | `/api/issues/my` | Authenticated | Get tickets submitted by logged-in user |
| `GET` | `/api/issues/assigned` | Dev & Admin | Get issues assigned to logged-in developer |
| `GET` | `/api/issues/stream` | Dev & Admin | Server-Sent Events (SSE) stream for real-time updates |
| `GET` | `/api/issues` | Admin Only | View all submitted issues with optional filters |
| `GET` | `/api/issues/stats` | Admin Only | Issue count breakdown by status and priority |
| `GET` | `/api/issues/developers`| Admin Only | Get developer list for assignment dropdowns |
| `PATCH` | `/api/issues/:id/assign` | Admin Only | Assign or unassign an issue to a developer |
| `PATCH` | `/api/issues/:id/status` | Dev & Admin | Update ticket status (`pending`, `in-progress`, `closed`) |
| `POST` | `/api/issues/:id/comments` | Dev & Admin | Add progress note or comment to ticket |
| `GET` | `/api/issues/:id/comments` | Submitter/Dev/Admin | Fetch comment thread for an issue |
| `PUT` | `/api/issues/:id` | Submitter / Admin | Edit issue title, description, or priority |
| `PATCH` | `/api/issues/:id` | Submitter / Admin | Partial update of issue details |
| `DELETE` | `/api/issues/:id` | Submitter / Admin | Delete an issue |

---

## ⚙️ Environment Variables

Create `.env` inside `backend/`:
```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Yes | `5001` | Server listener port |
| `NODE_ENV` | Yes | `development` | Environment mode (`development` / `production`) |
| `CLIENT_URL` | Yes | `http://localhost:3000` | Allowed CORS frontend origin |
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/issue_tracker` | MongoDB connection URI |
| `ACCESS_TOKEN_SECRET` | Yes | - | Secret for signing short-lived JWT access tokens |
| `REFRESH_TOKEN_SECRET`| Yes | - | Secret for signing 7-day refresh tokens |
| `ACCESS_TOKEN_EXPIRES_IN`| No | `15m` | Token expiry duration |
| `REFRESH_TOKEN_EXPIRES_IN`| No | `7d` | Refresh cookie lifespan |
| `ADMIN_NAME` | Yes | `System Administrator` | Initial admin account name |
| `ADMIN_EMAIL` | Yes | `admin@issuetrackr.com` | Initial admin account email |
| `ADMIN_PASSWORD` | Yes | `AdminPassword123!` | Initial admin password (&ge; 8 characters) |

---

## 💻 Setup, Installation & Running

```bash
# 1. Install dependencies
npm install



# 3. Start development server (Port 5001)
npm run dev

# 4. Check TypeScript types
npx tsc --noEmit

# 5. Build for production (outputs to dist/)
npm run build

# 6. Start production server
npm start
```

---

## 🚢 Production Deployment

### Deploying to Render (Web Service)

1. **Create Web Service:**
   - In [Render Dashboard](https://dashboard.render.com), click **New +** &rarr; **Web Service** and connect this repository.
2. **Build & Runtime Configuration:**
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
3. **Environment Variables on Render:**
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app` (your Vercel frontend URL)
   - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster.mongodb.net/issue_tracker?retryWrites=true&w=majority`
   - `ACCESS_TOKEN_SECRET`: `<secure-random-32+-char-string>`
   - `REFRESH_TOKEN_SECRET`: `<secure-random-32+-char-string>`
   - `ACCESS_TOKEN_EXPIRES_IN`: `15m`
   - `REFRESH_TOKEN_EXPIRES_IN`: `7d`
   - `ADMIN_NAME`: `System Administrator`
   - `ADMIN_EMAIL`: `admin@issuetrackr.com`
   - `ADMIN_PASSWORD`: `<strong-password>`
4. **Seed Administrator:**
   Open the Render **Shell** tab after the initial build succeeds and run:
   ```bash
   npm run create-admin
   ```
5. **Auto-Deploy:**
   Pushes to your GitHub branch automatically trigger rolling zero-downtime rebuilds on Render.

---

## 🌐 Service URLs

- **Local Development API:** `http://localhost:5001/api`
- **Production Public API:** `Pending` *(Not yet deployed to a public cloud environment)*
- **Master Documentation:** [Root README](../README.md) & [BRD](../brd.md)

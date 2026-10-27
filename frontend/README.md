# IssueTrackr — Frontend Web Application

Modern Single Page Application (SPA) for **IssueTrackr**, built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **Redux Toolkit**, and **React Router DOM v7**.

---

## 🚀 Tech Stack

- **Framework & Bundler:** React 18, Vite v5 with `@vitejs/plugin-react`
- **Language:** TypeScript (v5+) with strict type checking
- **Styling:** Tailwind CSS v4 with `@tailwindcss/vite` plugin
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Client Routing:** React Router DOM v7 with role-guarded `ProtectedRoute`
- **HTTP Client:** Axios v1.20 with request/response interceptors and silent token refresh queue

---

## 🏛️ Architecture & Design Pattern

The frontend is structured using a **Feature-Sliced Architecture** with **Redux Toolkit** and **Axios Interceptors**:

```
User Action ──► UI Feature Component ──► Feature Service ──► Axios Client (api.ts) ──► Express Backend
                         │                                           │
                         ▼                                           ▼
                 Redux Toolkit Store ◄─────────────────── Silent Token Refresh
```

- **Feature-Sliced Modules (`src/features/`):**
  - **`auth`:** Login, registration, profile views, and session slice (`authSlice.ts`).
  - **`issues`:** Issue reporting forms, personal ticket lists, triage modals, and decoupled services.
  - **`developer`:** Developer queue (`/dev`), status update toggles, and sprint stats.
  - **`admin`:** Executive dashboard (`/admin`), user management CRUD tables, and developer assignment modals.
- **Shared Utilities (`src/shared/`):** Shared navigation (`Navbar.tsx`) and the central Axios API client (`api.ts`).
- **Role-Guarded Routing (`src/components/ProtectedRoute.tsx`):** Protects routes by evaluating active Redux user roles before rendering components.
- **Silent Token Refresh Queue:** Automatically catches expired JWT access tokens and seamlessly refreshes them via the HttpOnly cookie without losing in-flight requests.

## 📁 Folder Structure

```
frontend/
├── index.html              # HTML document root
├── package.json            # Scripts & dependencies
├── vite.config.ts          # Vite configuration & dev proxy
├── tsconfig.json           # TypeScript configuration
├── dist/                   # Production compiled output
└── src/
    ├── App.tsx             # Route definitions & Role-based guards
    ├── main.tsx            # React root mount & providers (Redux, AuthProvider)
    ├── index.css           # Tailwind CSS entrypoint
    ├── features/           # Feature-sliced modules
    │   ├── admin/          # Admin dashboard, user management table, modals
    │   ├── auth/           # Login, Register, Profile, AuthProvider, authService, authSlice
    │   ├── developer/      # Developer issue table, stats banner, filters
    │   └── issues/         # Issue forms, tables, modals & modular issue services
    │       └── services/   # types, management, assignment, comments, stats, facade
    ├── shared/             # Shared components (Navbar) & Axios client (api.ts)
    └── store/              # Redux store configuration
```

---

## 🧭 Routes & Role Access Control

| Route | Component | Permitted Roles | Description |
| :--- | :--- | :--- | :--- |
| `/` | `Home` | Everyone / User | Welcome banner for guests; Issue intake and tracking for logged-in users |
| `/login` | `Login` | Public | Sign in to account. Redirects to designated role dashboard |
| `/register` | `Register` | Public | Create a new user account |
| `/profile` | `Profile` | Authenticated | View authenticated user name, email, and assigned role |
| `/dev` | `DeveloperDashboard` | Developer & Admin | Triage assigned tickets, advance status, and write technical notes |
| `/admin` | `AdminDashboard` | Admin Only | Global metrics, ticket triage, developer assignment, and user CRUD |
| `/unauthorized`| `Unauthorized` | Public | Access denied message when lacking required permissions |

---

## 🔌 Modular Issue Services (`src/features/issues/services/`)

To keep code maintainable, issue operations are decoupled into focused service files:

- **`types.ts`:** Shared TypeScript interfaces (`Issue`, `IssueStatus`, `IssuePriority`, payloads, responses).
- **`issue.management.service.ts`:** Core issue operations (`createIssue`, `getMyIssues`, `getAllIssues`, `updateIssue`, `deleteIssue`, `updateIssueStatus`).
- **`issue.assignment.service.ts`:** Developer assignment functions (`assignIssue`, `getDevelopers`).
- **`issue.comments.service.ts`:** Comment thread operations (`addComment`, `getComments`).
- **`issue.stats.service.ts`:** Metric aggregation (`getIssueStats`).
- **`issueService.ts`:** Unified facade combining all services into a single clean API export.

---

## 🔒 Silent Token Refresh & Axios Client (`src/shared/services/api.ts`)

- **Dual-Token System:** Short-lived access token is stored securely in memory within Redux Toolkit (`authSlice`). The long-lived refresh token is maintained in an `HttpOnly`, `SameSite` browser cookie.
- **Request Interceptor:** Automatically injects the active access token via `Authorization: Bearer <token>`.
- **Response Interceptor:** Automatically intercepts `401 Unauthorized` responses and silently requests a new access token via `/api/auth/refresh-token`. In-flight requests are queued and re-executed without user interruption.

---

## 💻 Setup, Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server (Port 3000)
npm run dev

# 3. Check TypeScript types
npx tsc --noEmit

# 4. Build for production (outputs to dist/)
npm run build

# 5. Preview production build locally
npm run preview
```

---

## 🚢 Production Deployment

### Deploying to Vercel

1. **Import Project into Vercel:**
   - In [Vercel Dashboard](https://vercel.com/dashboard), click **Add New...** &rarr; **Project** and select this repository.
2. **Build Settings:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. **Environment Variables on Vercel:**
   Add the following environment variable to connect to your live Render backend:
   - `VITE_API_URL`: `https://issue-tracking-system-7nly.onrender.com/api`
4. **SPA Fallback Routing (`vercel.json`):**
   Vercel uses the included [`vercel.json`](./vercel.json) to redirect all client-side routes to `index.html`:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
5. **Cross-Service Sync:**
   Once deployed, update the `CLIENT_URL` environment variable on your Render backend with your Vercel assigned domain (`https://issue-tracking-system-ten.vercel.app`).

---

## 🌐 Service URLs

- **Production Public URL:** `https://issue-tracking-system-ten.vercel.app`
- **Local Development Portal:** `http://localhost:3000`
- **Connected Backend API:** `https://issue-tracking-system-7nly.onrender.com/api`
- **Master Documentation:** [Root README](../README.md) & [BRD](../brd.md)

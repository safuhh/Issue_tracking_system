# IssueTrackr — Frontend

The IssueTrackr frontend is a React single-page application for submitting and tracking issues, managing assigned developer work, and viewing administrative dashboards.

- **Live application:** https://issue-tracking-system-ten.vercel.app/
- **Backend API:** https://issue-tracking-system-7nly.onrender.com/api

For project-wide requirements and the overall repository setup, see the [root README](../README.md) and [Business Requirements Document](../brd.md).

## Tech Stack

- React 18 and TypeScript
- Vite
- Tailwind CSS v4
- Redux Toolkit and React-Redux
- React Router DOM
- Axios

## Frontend Features

- Registration, login, profile, and authenticated session handling
- Role-based pages for users, developers, and administrators
- Issue creation and personal issue tracking
- Developer views for assigned issues, status updates, and comments
- Admin views for issue oversight, developer assignment, and user management
- Shared API client for backend requests and token-refresh handling
- Responsive interface for desktop and mobile screens

## Architecture

The frontend uses a feature-based modular structure. Feature-specific pages, components, services, and types are grouped by area, while shared UI, API configuration, and global state are kept in shared locations.

```text
frontend/
├── index.html
├── package.json
├── vite.config.ts
├── vercel.json
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── features/
    │   ├── auth/
    │   ├── issues/
    │   ├── developer/
    │   └── admin/
    ├── shared/
    │   └── services/
    │       └── api.ts
    └── store/
```

The exact contents of each feature folder may evolve; this overview shows the main module boundaries.

## Routes

| Route | Purpose | Access |
| :--- | :--- | :--- |
| `/` | Home page and user issue view | Public / authenticated user, depending on session |
| `/login` | Sign in | Public |
| `/register` | Create a user account | Public |
| `/profile` | View the signed-in user's profile | Authenticated |
| `/dev` | Developer workspace | Developer and permitted admin users |
| `/admin` | Administrative dashboard and user management | Admin |
| `/unauthorized` | Access-denied page | Public |

The backend must enforce authorization independently; frontend route protection alone is not a security boundary.

## Prerequisites

- Node.js 18 or later
- npm
- Access to the IssueTrackr backend API

## Installation and Local Development

From this directory (frontend/), run:

```bash
npm install
```

Create a local environment file if the application uses one, then set the API base URL as described below. Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite in the terminal. If your Vite configuration explicitly sets port 3000, the address will be http://localhost:3000; otherwise, use the port printed by the command.

## Environment Variables

Configure the frontend API base URL using the environment variable expected by src/shared/services/api.ts. The current project documentation names it VITE_API_URL:

```env
VITE_API_URL=https://issue-tracking-system-7nly.onrender.com/api
```

For local development, use the appropriate local API URL if needed. Vite exposes variables prefixed with VITE_ to browser code, so do not put passwords, private keys, database credentials, or other secrets in frontend environment variables.

Keep local .env files out of Git. Commit a placeholder-only .env.example when a setup template is useful.

## Useful Commands

Run these commands from frontend/:

```bash
# Type-check the frontend
npx tsc --noEmit

# Create a production build in dist/
npm run build

# Preview the production build locally
npm run preview
```

## Deployment to Vercel

The frontend is deployed on Vercel from the frontend/ directory in the shared repository.
1. Import the GitHub repository into Vercel.
2. Set Root Directory to frontend.
3. Select the Vite framework preset.
4. Set Build Command to npm run build and Output Directory to dist.
5. Add the frontend API environment variable in Vercel Project Settings. Ensure its name matches the variable read by src/shared/services/api.ts.
6. Confirm vercel.json contains the SPA rewrite configuration required for client-side routes.
7. Deploy the project and test registration/login, protected routes, issue actions, and API requests against the deployed backend.

The backend must allow the deployed Vercel origin through its CORS configuration. Configure that origin in the backend hosting environment; do not store backend secrets in this frontend project.

## URLs

- Production frontend: https://issue-tracking-system-ten.vercel.app/
- Backend API base URL: https://issue-tracking-system-7nly.onrender.com/api
- Root project README: [README.md](../README.md)
- Backend documentation: [README.md](../backend/README.md)
- BRD: [brd.md](../brd.md)
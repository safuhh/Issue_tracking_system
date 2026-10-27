# IssueTrackr — Issue Tracking System

IssueTrackr is a full-stack issue tracking application that helps users report issues, developers work on assigned issues, and administrators manage assignments, users, and progress.

## Live Application

- Frontend: https://issue-tracking-system-ten.vercel.app/
- Backend API: https://issue-tracking-system-7nly.onrender.com/api
- Source code: https://github.com/safuhh/Issue_tracking_system

The backend is hosted on Render's free service, so its first request after inactivity may take longer while the service wakes up.

## Features

- User registration and login with role-based access for user, developer, and admin.
- Create, view, edit, and delete issues according to the user's permissions.
- Assign issues to developers and track their status.
- Add and view comments on authorized issues.
- Admin dashboard with issue counts, user management, and issue assignment.
- Developer workspace for viewing assigned issues and updating their status.
- JWT-based authentication with an HTTP-only refresh-token cookie.

## Tech Stack

| Area | Technologies |
| :--- | :--- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, Redux Toolkit, React Router, Axios |
| Backend | Node.js, Express, TypeScript, Mongoose, JWT, bcryptjs, Joi |
| Database | MongoDB / MongoDB Atlas |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

## Repository Structure

```text
Issue_tracking_system/
├── README.md              # Project overview and quick start
├── brd.md                 # Business Requirements Document
├── frontend/              # React + Vite application
│   └── README.md           # Frontend setup and deployment details
└── backend/               # Express REST API
    └── README.md           # Backend setup, API reference, and deployment details
```

For implementation details, use the dedicated [frontend README](./frontend/README.md), [backend README](./backend/README.md), and [Business Requirements Document](./brd.md).

## Run Locally

### Prerequisites

- Node.js 18 or later and npm
- MongoDB running locally or a MongoDB Atlas connection string

### 1. Install dependencies

From the repository root:

```bash
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure the backend

Copy the environment template and update its values:

```bash
cp backend/.env.example backend/.env
```

Set the database URI, JWT secrets, frontend origin, and any other variables required by backend/.env.example. Keep real secrets in local environment files or hosting-platform settings; never commit them to GitHub.

### 3. Configure the frontend

Create frontend/.env and set the API base URL using the variable name expected by the frontend API client. For the deployed backend, the value is:

```env
VITE_API_URL=https://issue-tracking-system-7nly.onrender.com/api
```

If your API client uses a different environment-variable name, use that exact name instead. Do not put private credentials in VITE_ variables because frontend variables are exposed to the browser.

### 4. Create the initial admin account

Follow the seeding instructions in [Backend Documentation](./backend/README.md). Configure the admin credentials through environment variables; do not use sample credentials in a public repository.

### 5. Start the applications

Run each command in a separate terminal from the repository root:

```bash
npm run dev --prefix backend
npm run dev --prefix frontend
```

Open the local frontend URL printed by Vite in your terminal. Confirm the backend port and API prefix in the backend configuration.

## Build and Type Checks

Run from the repository root:

```bash
(cd backend && npx tsc --noEmit)
(cd frontend && npx tsc --noEmit)
npm run build --prefix backend
npm run build --prefix frontend
```

See the individual README files for any project-specific test scripts and additional verification steps.

## Deployment Overview

- Database: Create a MongoDB Atlas cluster and configure its database credentials and network access.
- Backend: Deploy the backend directory as a Render Web Service. Configure the required backend environment variables and the production frontend origin for CORS.
- Frontend: Deploy the frontend directory to Vercel. Configure the frontend API URL to point to the deployed Render API, then redeploy.
- Updates: Push changes to the connected GitHub branch and check the Render and Vercel deployment logs after each deployment.

Detailed setup, environment-variable lists, API endpoints, and platform-specific deployment steps are documented in [backend/README.md](./backend/README.md) and [frontend/README.md](./frontend/README.md).

## Documentation

- [Business Requirements Document (BRD)](./brd.md)
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
# SecureVote - Online Voting System

SecureVote is a MERN stack online voting system with JWT authentication, Gmail SMTP verification, password reset, role-based dashboards, secure one-vote-per-election enforcement, profile uploads, QR voter cards, live Socket.io results, and Chart.js visualizations.

## Folder Structure

```text
backend/
  config/        MongoDB and Socket.io helpers
  controllers/   Auth, admin, election, user controllers
  middleware/    JWT auth, role guards, validation, uploads, errors
  models/        User, Election, Vote, AuditLog
  routes/        Express API routes
  utils/         Email, JWT, audit helpers, admin seeder
  uploads/       Profile and candidate images
frontend/
  src/
    components/  Layout, protected route, spinner, charts
    context/     Auth provider
    pages/       Auth, voter, admin screens
    services/    Axios and Socket.io clients
```

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Configure backend environment:

```bash
cp backend/.env.example backend/.env
```

Set `MONGO_URI`, `JWT_SECRET`, and Gmail SMTP values. For Gmail, create a Google App Password and use it as `SMTP_PASS`.

3. Configure frontend environment:

```bash
cp frontend/.env.example frontend/.env
```

4. Create the first admin:

```bash
npm run seed:admin --prefix backend
```

5. Start development servers:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`; backend runs on `http://localhost:5000`.

## Security Notes

- Passwords are hashed with bcrypt before storage.
- JWT authentication protects API routes.
- Admin endpoints require `role: "admin"`.
- Voting requires verified email and a unique `{ election, user }` vote index.
- Helmet, CORS, rate limiting, upload size limits, and input validation are enabled.
- Forgot password tokens expire after 15 minutes; email verification tokens expire after 24 hours.

## Deployment

- Frontend: deploy `frontend` to Vercel or Netlify and set `VITE_API_URL`.
- Backend: deploy `backend` to Render or Railway and set all backend environment variables.
- Database: use MongoDB Atlas and set `MONGO_URI`.
- Set `CLIENT_URL` on the backend to the deployed frontend URL so email links and CORS work correctly.

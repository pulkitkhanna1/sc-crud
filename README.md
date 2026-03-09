# CPI Workflow Studio

This project converts the original single-file `content-workflow.tsx` prototype into a full-stack workflow app.

## Stack

- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript
- Database: PostgreSQL + Prisma ORM
- Seed data: derived from the original JSX prototype

## What is persisted

- People and roles
- Ideas and idea review state
- Beats and beat review state
- Writing assignments
- Improvement / rework requests
- Production readiness state
- Server-side counters for `I0001`, `B0001`, and `00001` style IDs

## Project structure

- `client/`: React app
- `server/src/`: Express API
- `api/[...route].ts`: Vercel serverless API entrypoint
- `server/prisma/schema.prisma`: data model
- `server/prisma/seed.ts`: sample workflow data
- `vercel.json`: Vercel build/runtime config
- `content-workflow.tsx`: original prototype kept as reference

## Local setup

1. Create a Postgres database.
   - Preferred: use the same hosted Postgres you plan to use with Vercel.
   - Optional: run Postgres locally if you already have it installed.
2. Update `.env` with that database connection.
   - `DATABASE_URL` should be your app connection string.
   - `DIRECT_URL` should be the direct connection string for Prisma migrations.
3. Install dependencies:
   - `npm install`
4. Generate Prisma client:
   - `npm run prisma:generate`
5. Create the database schema:
   - `npm run prisma:migrate -- --name init`
6. Seed the database:
   - `npm run prisma:seed`
7. Start the app:
   - `npm run dev`

Frontend runs on `http://localhost:5173`.

API runs on `http://localhost:4000`.

Local frontend requests use `/api` and are proxied by Vite to the local Express server, so the same client config also works on Vercel.

## No Docker

If `docker` is not installed, skip it entirely.

This project does not require Docker as long as you already have a Postgres database somewhere.

The simplest path is:

1. Create a hosted Postgres database.
2. Put its connection strings into `.env`.
3. Run:
   - `npm run prisma:migrate -- --name init`
   - `npm run prisma:seed`
   - `npm run dev`

## Vercel setup

1. Create a hosted Postgres database. Use Neon, Supabase, Railway, or Vercel Postgres.
2. In Vercel, import this repo or folder as a project.
3. Add the environment variables from `.env.vercel.example` in the Vercel dashboard:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `CLIENT_ORIGIN`
   - `VITE_API_URL`
4. Keep `VITE_API_URL` as `/api`.
5. Run the Prisma migration once against the hosted database:
   - `npm run prisma:migrate -- --name init`
6. Seed the hosted database if you want the sample workflow data:
   - `npm run prisma:seed`
7. Deploy.

The Vercel config already assumes:

- Static frontend output comes from `client/dist`
- API requests are served by the serverless function in `api/[...route].ts`
- Node runtime is configured in `vercel.json`

## Build

- `npm run build`

## Notes

- Local production-style runs still serve the built frontend from the Express server.
- On Vercel, the frontend is static and the API runs as a serverless function.
- Prisma is configured against PostgreSQL by default for real persistence and future multi-user use.
- `DIRECT_URL` is included for Prisma migrations against pooled serverless Postgres setups.
- If you want auth next, the clean insertion point is the Express API layer and session header in the React app.

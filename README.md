# Coding Challenge

A minimal full-stack starter with React, Express, and PostgreSQL.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/ui, TanStack Query
- **Backend**: Node.js, Express 5
- **Database**: PostgreSQL with Drizzle ORM

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Getting Started

```bash
npm run docker:dev
```

This starts the full stack (app + PostgreSQL) via Docker Compose. The app will be available at [http://localhost:5000](http://localhost:5000). Hot reload is enabled — changes to source files are reflected immediately.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run docker:dev` | Start the full stack with Docker Compose |
| `npm run db:push` | Push schema changes to the database |
| `npm run build` | Build for production |
| `npm run check` | TypeScript type check |

## Project Structure

```
client/        # React frontend (Vite)
  src/
    App.tsx
    components/ui/
    lib/
server/        # Express backend
  index.ts
  routes.ts
  db.ts
shared/        # Shared types and schema
  schema.ts
```

## Environment Variables

See `.env.example` for reference. When using `npm run docker:dev` these are set automatically via `docker-compose.yml`.

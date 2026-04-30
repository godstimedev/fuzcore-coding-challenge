# CLAUDE.md

Permanent context for Claude when working in this repository.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/ui, TanStack Query
- **Backend**: Node.js, Express 5
- **Database**: PostgreSQL with Drizzle ORM

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

## Architectural Guidelines (Strict)

1. **Database**: Update `shared/schema.ts` using Drizzle ORM first, then migrate using `npm run db:push`.
2. **API Client**: Strictly use axios. Create two instances in `client/src/lib/axios.ts`: a public instance, and a private instance that uses `withCredentials: true` to handle session cookies and a response interceptor to handle 401 redirects.
3. **React Query Architecture**: Abstract all fetching into domain-specific custom hooks (e.g. `client/src/hooks/auth/useLogin.ts`). Hooks must return the query/mutation object directly so the component can destructure it cleanly (e.g. `const { mutate, isPending } = useLogin()`). Handle UI side-effects (routing, toasts, form errors) inside the component's `onSuccess`/`onError`, not inside the hook.
4. **Routing Structure**: Use wouter. Keep `App.tsx` strictly for routing declarations. Never define components/pages like `Dashboard` or `ProtectedRoute` inside `App.tsx` — extract them into their proper `pages/` or `components/` folders. All global providers must be placed in `client/src/main.tsx`.
5. **Layout Architecture**: Create a `client/src/components/layout/AppShell.tsx` component. This shell must contain the global Navbar/Navigation. Wrap all protected routes inside this AppShell so the navigation remains persistent and consistent across the entire application.
6. **Conditional Navigation**: The Navbar must react to the user state from `AuthContext`. If no user is present, show 'Login/Signup' links. If a user is authenticated, show 'Dashboard', 'Customers', 'Transactions', 'Invoices', and the 'Logout' button.
7. **Constants & Magic Strings**: Create a `client/src/constants/` folder. Store all application routes in `routes.ts` (`APP_ROUTES`) and API endpoints in `apiUrls.ts` (`API_URLS`). Never hardcode URL strings in hooks or components.
8. **Page Structure**: Use a folder-based structure for pages (e.g. `client/src/pages/Signup/index.tsx`).
9. **UI Components**: Strictly use Tailwind CSS and Shadcn/ui.
10. **Strict Version Management**: Never blindly install the `@latest` versions of new packages. You must analyze the existing `package.json` to ensure compatibility. For example, since the starter code is locked to Zod v3, you must explicitly install matching compatible middleware, such as `npm install @hookform/resolvers@3.9.0`, to prevent module resolution conflicts during Vite pre-bundling.
11. **Backend Separation of Concerns**: Do not put business logic or database queries directly inside route definitions. Use a `server/controllers/` folder. `server/routes/` files should only handle routing and middleware wiring, then delegate to the appropriate controller function.
12. **Security & Edge Cases**: Never trust the client. Strictly validate all incoming payloads using Zod. For every backend CRUD operation, you MUST scope the database query to the authenticated `req.session.userId`. Prevent IDOR (Insecure Direct Object Reference) by ensuring users can only read, update, or delete records they explicitly own. Wrap multi-table operations (like Invoices + Invoice Items) in database transactions.
13. **Docker Dependency Sync**: If you install a new npm package, the running Docker container will crash because its isolated `node_modules` will be out of sync. Whenever you add a dependency, you MUST automatically run `docker compose up --build -d` in the terminal to rebuild the container and keep the environment stable.

# ThreadForge Frontend

React + TypeScript SPA for the ThreadForge discussion forum.

## Stack

- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Context API (authentication)

## Quick start

1. **Start the backend** (from `forum-backend/`):

   ```bash
   npm install
   cp .env.example .env   # configure MongoDB + JWT
   npm run dev
   ```

2. **Start the frontend** (from `forum-frontend/`):

   ```bash
   npm install
   cp .env.example .env
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173)

## API configuration

| Environment | `VITE_API_URL` | Notes |
|-------------|----------------|-------|
| Development | Leave empty or omit | Vite proxy forwards `/api` → `http://localhost:5000` |
| Production  | `http://your-server:5000/api` | Full backend URL including `/api` |

## Folder structure

```
src/
├── api/           # Axios instance + endpoint functions
├── components/    # Reusable UI (layout, posts, comments, auth)
├── pages/         # Route-level screens
├── context/       # AuthContext (global auth state)
├── hooks/         # useAuth custom hook
├── routes/        # React Router configuration
├── types/         # TypeScript interfaces
├── utils/         # buildCommentTree, storage, helpers
├── assets/        # Static files
├── App.tsx
└── main.tsx
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |

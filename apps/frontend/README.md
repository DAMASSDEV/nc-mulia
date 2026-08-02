# Frontend

Node modules are managed by the root `npm install` via npm workspaces.

To install dependencies:
```bash
npm install
```

To run development server:
```bash
npm run dev          # from project root
# or
npm -w apps/frontend run dev
```

For frontend-only development on port 5173 (backend still needed for API):
```bash
npm run dev:frontend
```

Build:
```bash
npm run build:frontend
```

Lint:
```bash
npm run lint:frontend
```

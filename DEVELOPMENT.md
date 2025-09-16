# CashFlow Development Guide

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Zustand** for state management
- **React Router** for navigation
- **Axios** for HTTP requests
- **React Hook Form + Zod** for form handling and validation
- **Vite** for build tooling

### Backend
- **Go** with Wails framework
- Structured architecture with services and models

## Project Structure

```
cashflow/
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ui/       # shadcn/ui components
│   │   │   └── layout/   # Layout components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── stores/       # Zustand stores
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Utility functions
│   │   └── lib/          # Library utilities
│   └── package.json
├── internal/              # Go backend code
│   ├── handlers/         # Request handlers
│   ├── services/         # Business logic
│   ├── models/          # Data models
│   └── utils/           # Utilities
├── app.go                # Main Wails app
├── main.go              # Entry point
└── wails.json           # Wails configuration
```

## Development Commands

### Run in Development Mode
```bash
wails dev
```
This starts the application with hot-reload enabled for both frontend and backend.

### Build for Production
```bash
wails build
```
Creates an optimized production build of your desktop application.

### Frontend Only Development
```bash
cd frontend
npm run dev
```

### Type Checking
```bash
cd frontend
npm run type-check
```

### Build Frontend Only
```bash
cd frontend
npm run build
```

## Key Features Configured

1. **TypeScript Support**: Full TypeScript support with strict mode enabled
2. **Path Aliases**: Use `@/` to import from `src/` directory
3. **Dark Mode**: Toggle between light and dark themes using Zustand store
4. **Component Library**: shadcn/ui components ready to use
5. **API Service**: Configured Axios with interceptors for API calls
6. **State Management**: Zustand store with persistence
7. **Routing**: React Router configured for navigation

## Adding New Features

### Creating a New Component
1. Create component in `frontend/src/components/`
2. Use shadcn/ui components from `@/components/ui/`
3. Import utilities from `@/lib/utils`

### Adding Backend Endpoints
1. Create service in `internal/services/`
2. Define models in `internal/models/`
3. Export methods in `app.go`
4. Methods will be auto-generated in `frontend/wailsjs/`

### Using Zustand Store
```typescript
import { useAppStore } from '@/stores/useAppStore'

const MyComponent = () => {
  const { theme, toggleTheme } = useAppStore()
  // Use store values and actions
}
```

### Making API Calls
```typescript
import apiService from '@/services/api'

const fetchData = async () => {
  const data = await apiService.get('/endpoint')
  return data
}
```

## Environment Notes

- Wails binds Go functions directly to the frontend
- No need for REST API endpoints for Go backend functions
- Use `wailsjs/go/` imports to call backend methods from frontend
- Hot-reload works for both frontend and backend changes

## Tips

1. Always run `wails dev` from the project root
2. Frontend changes reflect immediately
3. Backend changes require a rebuild (automatic in dev mode)
4. Use the browser DevTools when running in development mode
5. The app uses system webview for rendering
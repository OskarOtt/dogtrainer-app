# Copilot instructions for dogtrainer-app

## Expo version note
This project pins Expo SDK **57**, a recent major version. APIs may differ from
older training data. Before writing Expo/React Native/expo-router code, check
the versioned docs at https://docs.expo.dev/versions/v57.0.0/.

## Commands
- `npm run start` (or `npx expo start`) — dev server.
- `npm run android` / `npm run ios` / `npm run web` — start targeting a platform.
- `npm run lint` — runs `expo lint` (ESLint, flat config in `eslint.config.js`, extends `eslint-config-expo`).
- No test runner is configured in this repo.

## Architecture
- File-based routing via `expo-router`; routes live under `src/app/` (not top-level `app/`).
  `src/app/_layout.tsx` wraps everything in `QueryClientProvider` → `AuthProvider` → `ThemeProvider`,
  and gates the whole `Stack` behind `Stack.Protected` guards based on `isAuthenticated` from `useAuth()`
  — unauthenticated users only ever see the `(auth)` group. When adding a new authenticated screen,
  register it as a `<Stack.Screen>` inside the `isAuthenticated` guard in `_layout.tsx`.
- Strict layering for data access: `src/api/*.ts` are thin wrappers around the shared `apiClient`
  (axios instance in `src/api/client.ts`) — one file per resource (`dogs.ts`, `plans.ts`, `sessions.ts`, etc).
  `src/hooks/use-*.ts` wrap each api module with TanStack Query (`useQuery`/`useMutation`), owning query
  keys and cache invalidation. **UI code and hooks must never call `apiClient`/axios directly** — always go
  through the matching `api/*` module.
- Auth/token refresh is decoupled from the API client via a registered callback to avoid a circular import:
  `src/api/client.ts` exposes `registerRefreshHandler`, and `src/hooks/use-auth.tsx` registers the actual
  refresh logic (using `authApi.refresh` + `tokenStorage`) on mount. The axios response interceptor uses
  this handler to silently retry a request once after a 401, deduping concurrent refreshes via a shared
  `refreshPromise`.
- Tokens live in `expo-secure-store`, accessed only via `src/utils/tokenStorage.ts`.
- Single shared `QueryClient` in `src/data/queryClient.ts` (`staleTime: 30s`, no refetch-on-focus). On
  logout, `AuthProvider.clearSession` calls `queryClient.clear()` to wipe all cached data.
- Path aliases: `@/*` → `src/*`, `@/assets/*` → `assets/*` (see `tsconfig.json`).
- Domain types live in `src/types/*.ts`, one file per resource, typically exporting both the entity
  (e.g. `Dog`) and its write payload (e.g. `DogPayload`) shape.

## Conventions
- Query key convention (see `src/hooks/use-dogs.ts`): a list key like `['dogs']` and a per-item key
  factory like `(id) => ['dogs', id]`; mutations invalidate both the list key and, where relevant, the
  specific item key on success.
- Components in `src/components/` are kebab-case files (e.g. `dog-card.tsx`, `training-plan-card.tsx`).
  Platform-specific variants use the `.web.tsx` suffix (e.g. `date-picker.web.tsx`).
- API base URL comes from `EXPO_PUBLIC_API_URL` env var (see `.env.example`), defaulting to
  `http://localhost:8080/api/v1`.

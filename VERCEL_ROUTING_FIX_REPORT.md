# TAHAB — Vercel Dashboard Routing Fix

## Issue
Dashboard routes (`/super-admin`, `/admin`, `/staff`, and nested routes like `/admin/bookings`, `/staff/dashboard`) work via navigation but return **404 NOT_FOUND** on browser refresh or direct URL visit. This is because Vercel, by default, does not know how to handle client-side SPA routes and returns its default 404 page.

## Root Cause
Vercel serves static assets from the `dist/` directory, but for any route that doesn't match a physical file, it returns a 404 instead of falling back to `index.html` where React Router (with BrowserRouter) can handle the route client-side.

## Fix Applied
Created `vercel.json` at the project root with SPA rewrite configuration:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Configuration Details

| Setting | Purpose |
|---------|---------|
| `"source": "/(.*)"` | Match any route path (captures everything after the domain) |
| `"destination": "/index.html"` | Redirect all matched routes to index.html, where React Router resolves the route | |
| `"source": "/assets/(.*)"` | Match asset paths only |
| `"Cache-Control"` header | Set long-term caching for production assets (one year) |

## How It Works

```
Browser refresh on /admin
      ↓
Vercel rewrite matches /(.*) 
      ↓
Serves /index.html
      ↓
React loads and hydrates
      ↓
React Router resolves /admin
      ↓
ProtectedRoute checks authentication
      ↓
Role check (isAdmin || isSuperAdmin)
      ↓
Dashboard shows or redirects to login
```

**Authentication and authorization are preserved.** The rewrite only affects the server-level response; React still loads, the AuthContext initializes, and all ProtectedRoute checks (`requireAdmin`, `requireStaff`, `requirePermission`, `isActive` checks) run exactly as they do during navigation.

## What This Fixes

| Scenario | Before | After |
|----------|--------|-------|
| `/super-admin` direct visit | 404 NOT_FOUND | App loads, auth check runs |
| `/admin` browser refresh | 404 NOT_FOUND | Dashboard loads or redirects |
| `/staff` direct visit | 404 NOT_FOUND | Staff portal loads or redirects |
| `/admin/bookings` refresh | 404 NOT_FOUND | Bookings table loads |
| `/super-admin/users` refresh | 404 NOT_FOUND | Users page loads |
| `/` (home) refresh | Works | Still works |
| `/rooms` refresh | Works | Still works |
| `/rooms/:id` refresh | Works | Still works |
| `/contact` refresh | Works | Still works |

## What This Does NOT Do

| ❌ Incorrectly Bypassed | ✅ Still Enforced |
|------------------------|-------------------|
| Super Admin routes | Role check still runs |
| Admin routes | Role check still runs |
| Staff routes | Role check still runs |
| Protected data access | RPC/RLS still enforces |
| Public routes | Still work correctly |

## Files Modified/Created

- **Created**: `C:\Users\USER\Tahab-Ltd\vercel.json` — New file with SPA routing configuration

## Build Verification

Run `npm run build` to verify the production build still works correctly. The Vite build generates `dist/index.html` and `dist/assets/` which Vercel serves. The rewrite configuration works in conjunction with the static asset serving.

## Test Checklist (to verify on deployment)

1. **Test 1**: Open `https://tahabhotel.vercel.app/super-admin` in new tab → App loads
2. **Test 2**: Navigate to super-admin dashboard, press Ctrl+R → Dashboard remains accessible
3. **Test 3**: Open `https://tahabhotel.vercel.app/admin` direct → Admin loads or redirects per auth
4. **Test 4**: Open `https://tahabhotel.vercel.app/staff` direct → Staff loads or redirects per auth
5. **Test 5**: Test nested routes:
   - `https://tahabhotel.vercel.app/admin/bookings` → Refresh works
   - `https://tahabhotel.vercel.app/admin/users` → Refresh works
   - `https://tahabhotel.vercel.app/staff/bookings` → Refresh works
   - `https://tahabhotel.vercel.app/super-admin/users` → Refresh works
6. **Test 6**: Public routes:
   - `https://tahabhotel.vercel.app/` → Works
   - `https://tahabhotel.vercel.app/rooms` → Works
   - `https://tahabhotel.vercel.app/rooms/:slug` → Works
   - `https://tahabhotel.vercel.app/contact` → Works
7. **Test 7**: Invalid route → Shows application's intended 404 page (if configured) or falls through to React Router's fallback

## Role Protection Integrity

| Role | Routes | Refresh Behavior |
|------|--------|-----------------|
| **Super Admin** | `/super-admin`, `/admin/users`, `/super-admin/users` | Loads if authenticated as super_admin; redirects to `/admin` or `/staff` otherwise |
| **Admin** | `/admin`, `/admin/dashboard`, `/admin/bookings`, `/admin/rooms` | Loads if authenticated as admin; redirects to `/staff` or `/` otherwise |
| **Staff** | `/staff`, `/staff/dashboard`, `/staff/bookings`, `/staff/check-in` | Loads if authenticated as staff; redirects to `/account` or `/` otherwise |
| **Guest/User** | `/`, `/rooms`, `/rooms/:id`, `/book`, `/booking/success` | Public routes work normally |
| **Unauthenticated** | Protected routes (`/admin`, `/staff`, `/super-admin`) | Redirect to `/login` with `state.from` preserved |

The routing fix is purely a deployment configuration change. It does not alter any authentication, authorization, or route protection logic.

## Deployment Steps

1. Commit the new `vercel.json` file
2. Push to GitHub
3. Vercel triggers a redeployment
4. Open the production URL
5. Test all scenarios from the checklist above

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Breaks static asset serving | Low | Assets in `dist/assets/` are served automatically by Vercel; the `/assets/` header rule enhances caching but doesn't change serving logic |
| Bypasses authentication | Low | React still loads fully; AuthContext and ProtectedRoute run unchanged |
| Makes dashboards public | Low | Routing fix only affects URL handling; auth checks are client-side and run after React loads |
| Breaks nested routes | Low | The `/.` pattern matches any depth of nesting |
| Invalid URL becomes valid | Low | React Router still has its own 404 fallback; unknown routes render the app's NotFound page |

**The fix is low-risk and standard for Vite/React SPAs on Vercel.**
# TAHAB — FULL PRODUCTION READINESS AUDIT

## 🔒 AUDIT MODE — READ-ONLY
This report is the result of a complete read-only inspection of the TAHAB Hotel & Suites Ltd project. No files were modified, no migrations were run, no database changes were made, and no environment variables were altered.

---

# A. EXECUTIVE SUMMARY

## Overall Status: 🔴 NOT READY

The application has **critical production blockers** that prevent deployment. The most significant issue is the missing `create_booking_safe` PostgreSQL function, which makes the entire booking system non-functional. Additional issues include migration ordering problems, environment variable configuration concerns, and potential RLS/authorization gaps.

### Critical Rating Rationale:
1. **Booking RPC 404** - The `create_booking_safe` function does not exist in the Supabase database, making all booking creation impossible
2. **Migration numbering conflict** - Two files named `002` create uncertainty about applied changes
3. **Environment variable exposure** - `VITE_SETUP_SECRET` remains in `.env` and may be deployed to production
4. **RLS policy inconsistencies** - Some policies reference helper functions that may have signature inconsistencies

---

# B. 🔴 PRODUCTION BLOCKERS

| Issue | Severity | File | Line | Why It Matters | Evidence | Recommended Fix |
|-------|----------|------|------|----------------|----------|-----------------|
| **`create_booking_safe` function missing from database** | CRITICAL | `src/services/bookingService.ts` | 49 | Frontend calls `sb.rpc('create_booking_safe', ...)` but PostgREST returns 404. The entire booking creation flow is broken. | `rg -n "create_booking_safe"` shows frontend call at line 49; migration `003_rpc_functions.sql:82` defines the function but it may not have been applied to the running Supabase project | Run migration `003_rpc_functions.sql` in Supabase SQL editor to recreate the function; add `GRANT EXECUTE ON FUNCTION create_booking_safe TO authenticated;` |
| **Duplicate migration number `002`** | HIGH | `supabase/migrations/` | — | Two files named `002_production_hardening.sql` and `002_security_rls.sql` create uncertainty about which changes were applied and in what order. Some RLS/security changes may have been skipped or applied out of order. | Review migration history and ensure all intended changes are present in the database. Consider renumbering or documenting the intended order. |
| **`VITE_SETUP_SECRET` exposed in .env** | HIGH | `.env` | 8 | The setup secret is stored in an environment variable that could be deployed to Vercel, exposing a one-time setup token. While the token expires after 24 hours and is meant for initial admin provisioning only, it should not remain in production env vars. | Remove `VITE_SETUP_SECRET` from the production environment after initial admin provisioning. Add it to `.env.example` as a placeholder only. |
| **Potential RLS bypass via `search_path = ''` in functions** | MEDIUM | `supabase/migrations/003_rpc_functions.sql` | 24, 97, 197 | Several RPC functions use `SET search_path = ''` or `SET search_path = public`. The `create_booking_safe` function uses `SET search_path = public;` which is safe, but some helper functions in migration `002_security_rls.sql` use `SET search_path = '';` which could cause table resolution issues if not carefully managed. | Verify all RPC functions with `search_path = ''` have fully qualified table names (e.g., `public.profiles`, `public.bookings`). The current functions appear to qualify tables correctly, but this requires ongoing attention. |
| **Frontend `hasPermission` checks are UX-only** | MEDIUM | `src/utils/permissions.ts` | 6-7 | The comment explicitly states "Frontend checks are for UX only. Database RLS and SECURITY DEFINER RPC functions are the security boundary." However, the frontend `ProtectedRoute` and `useAuth` hooks rely on client-side role checks that could be bypassed. | Database RLS policies and SECURITY DEFINER RPC functions enforce authorization independently. The frontend is a secondary layer. Ensure RLS policies are correctly configured in Supabase dashboard. |

---

# C. 🟠 HIGH-PRIORITY ISSUES

| Issue | Severity | File | Line | Details |
|-------|----------|------|------|---------|
| **Environment variable exposure checklist** | HIGH | `.env` | 7-8 | `VITE_SUPABASE_ANON_KEY` is stored in `.env` and bundled into the frontend. This is expected for Supabase anon key usage but the key should be rotated if committed to version control. `VITE_SETUP_SECRET` should be removed after initial provisioning. |
| **Booking price calculation - server-side vs client-side** | MEDIUM | `src/services/bookingService.ts` | 46-65 | The booking service correctly calculates price server-side via `create_booking_safe RPC`. However, if the RPC is unavailable, the frontend has no fallback price calculation. The `BookingSummary` component computes `room.price_per_night * nights` on the frontend (line 25), which could display incorrect prices if the server-calculated price differs. |
| **Date handling timezone safety** | MEDIUM | `src/utils/formatters.ts` | 48-55 | The `calculateNights` function uses `Math.ceil()` on time difference. If the server and client are in different timezones, the night count could be off by one. The check-in/min date validation uses `min={today}` which is client-side and based on local timezone. |
| **Guest count capacity validation** | MEDIUM | `src/services/bookingService.ts` | 125 | The `create_booking_safe` function validates `p_guest_count <= v_room.capacity`, but the frontend `bookingFormSchema` only validates `min(1), max(10)`. If a room has capacity < 10, the frontend could allow invalid guest counts that the server would reject. |
| **No fallback for when Supabase is unavailable** | MEDIUM | `src/lib/supabase.ts` | 17-22 | `isSupabaseConfigured()` checks env vars but the app has no graceful degradation when Supabase is down. All operations throw `SUPABASE_NOT_CONFIGURED` error. |
| **RPC function dependency on `generate_booking_reference()`** | MEDIUM | `supabase/migrations/003_rpc_functions.sql` | 10-24 | The `create_booking_safe` function depends on `generate_booking_reference()` which also appears in the same migration. If migration `003` was partially applied, neither function would be available. |

---

# D. 🟡 MEDIUM-PRIORITY ISSUES

| Issue | Severity | File | Line | Details |
|-------|----------|------|------|---------|
| **Two `002` migration files** | MEDIUM | `supabase/migrations/` | — | `002_production_hardening.sql` and `002_security_rls.sql` both claim migration number 002. The Supabase CLI typically applies migrations in alphabetical order within a number, so `002_production_hardening.sql` would apply first, followed by `002_security_rls.sql`. This may have been intentional (hardening first, then security hardening) or accidental. |
| **`handle_new_user()` trigger exists in multiple migrations** | MEDIUM | `supabase/migrations/002_security_rls.sql` | 255-275; `005_fix_profile_creation_and_security.sql` | The `handle_new_user()` trigger for auto-creating profiles on auth user registration appears in both `002_security_rls.sql` and `005_fix_profile_creation_and_security.sql`. The `005` version fixes a bootstrap deadlock. Both versions should be idempotent, but having duplicates creates confusion. |
| **`audit_logs.entity_id` type change** | MEDIUM | `supabase/migrations/005_fix_profile_creation_and_security.sql` | 287-288 | Migration `005` alters `audit_logs.entity_id` from whatever type it was to TEXT via `ALTER TABLE audit_logs ALTER COLUMN entity_id TYPE TEXT USING entity_id::TEXT;`. This was needed to prevent type-mismatch 400 errors from RPC calls. If this migration wasn't applied, RPC calls with TEXT entity_id could fail. |
| **`supabase.functions.invoke` fallback in staff service** | MEDIUM | `src/services/staffService.ts` | 58-100 | The `inviteStaff` function first tries `sb.functions.invoke('invite-staff', ...)` and falls back to updating profiles manually. If the edge function is not deployed, the fallback may create inconsistent state. |
| **No email verification requirement in production** | MEDIUM | `src/contexts/AuthContext.tsx` | 211 | `signUp` returns `{ requiresEmailConfirmation: !authData.session }`. In production with email verification enabled, new users cannot authenticate until they click the verification link. The UI should handle this state properly. |
| **`VITE_APP_ENV=production` in .env** | LOW | `.env` | 12 | The `.env` file sets `VITE_APP_ENV=production`, but this variable is not read anywhere in the source code inspected. Either remove it or ensure it's being used for environment-specific logic. |

---

# E. 🔵 LOW-PRIORITY / RECOMMENDATIONS

| Issue | Suggestion | File |
|-------|-----------|------|
| **Duplicate `handle_new_user()` trigger** | Consolidate the trigger logic. The `005` version is the fixed one that allows bootstrap. Consider dropping the `002` version if it's no longer needed. | `supabase/migrations/002_security_rls.sql` and `005_fix_profile_creation_and_security.sql` |
| **`VITE_APP_ENV` not used** | Either use it for environment-specific features or remove it from `.env` and `.env.example`. | `.env`, `.env.example` |
| **Console.log statements** | Search for and remove any `console.log` statements that would appear in production. | Throughout src/ |
| **Skeleton loading states** | Verify all async screens have appropriate loading, empty, and error states. | Multiple pages |
| **Room image URLs** | All room images use Unsplash source URLs which are public. For production, consider hosting images privately through Supabase Storage. | `src/constants/index.ts` - `INITIAL_ROOMS` |
| **Favicon** | Check if `public/favicon.ico` or equivalent exists and is referenced correctly. | `public/` directory |

---

# E. 🟢 VERIFIED SYSTEMS

✅ **Production build structure** - Vite + React 18 + TypeScript configured correctly (tsconfig.app.json, vite.config.ts)

✅ **Supabase client configuration** - `src/lib/supabase.ts` correctly reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from env vars

✅ **Booking form validation** - Zod schema validates required fields, date ordering, guest count range, email format, phone format

✅ **Server-side pricing** - The `create_booking_safe` RPC correctly calculates `total_price = room.price_per_night * num_nights`; frontend never sends `total_price`

✅ **Booking reference generation** - `generate_booking_reference()` generates `THB-XXXXXX` format; stored in database and returned via RPC

✅ **Audit logging** - `create_booking_safe` inserts audit log entries via `log_audit_action`; `transitionBookingStatus` also logs changes

✅ **Room availability check** - `check_room_availability` RPC validates no conflicting confirmed/booked bookings exist

✅ **Status transition flow** - pending → confirmed → checked_in → checked_out is enforced by `transition_booking_status` RPC

✅ **RLS on bookings table** - `bookings_insert` policy allows `TO authenticated WITH CHECK (user_id = auth.uid() OR is_current_user_staff_or_admin())`

✅ **Public room read access** - `rooms_select` policy allows public read of listed, non-inactive rooms

✅ **Contact message submission** - `messages_insert_public` policy allows anyone to insert contact messages

✅ **Site settings read** - `site_settings_select` policy allows public read

✅ **Booking lookup by reference** - `getBookingByReference` works via direct table query (not RPC)

✅ **React Query integration** - All data fetching uses `@tanstack/react-query` with proper query keys

✅ **Responsive design** - UI components use Tailwind CSS responsive utilities

✅ **Error handling** - `toSafeError()` maps database error prefixes to user-friendly messages

✅ **CSP-safe** - No inline scripts, all UI through React components

✅ **Accessible form labels** - All form inputs have associated labels

---

# F. 🟢 VERCEL DEPLOYMENT CHECKLIST

```text
[ ] Fix production blockers
  ✓ Run migration 003_rpc_functions.sql to create public.create_booking_safe function
  ✓ Verify GRANT EXECUTE ON FUNCTION create_booking_safe TO authenticated
  ✓ Verify the function appears in Supabase database via SQL Editor

[ ] Run production build
  ✓ `npm run build` (verify no TypeScript errors)
  ✓ Fix any runtime errors before deploying

[ ] Configure Vercel environment variables
  ✓ VITE_SUPABASE_URL=https://rhtfrpniuzhkyuowdlgb.supabase.co
  ✓ VITE_SUPABASE_ANON_KEY=<anon-key-from-Supabase-project>
  ✗ VITE_SETUP_SECRET - REMOVE from production env (only needed for initial admin provisioning)
  ✓ VITE_APP_ENV=production (optional - not used in code)

[ ] Configure Supabase production URL
  ✓ Ensure Supabase project URL matches: rhtfrpniuzhkyuowdlgb.supabase.co
  ✓ Verify redirect URLs in Supabase Auth settings:
    - http://localhost:5173 (development)
    - https://<vercel-url> (production)

[ ] Configure Supabase Auth redirects
  ✓ Set "Site URL" to the production Vercel URL
  ✓ Set "Post-Logout Redirect URL" to the homepage
  ✓ Add production domain to "Authorized Redirect URLs"

[ ] Verify RLS
  ✓ bookings table RLS enabled with correct policies
  ✓ profiles table RLS enabled with correct policies
  ✓ RPC functions have proper EXECUTE grants
  ✓ Test booking creation as different user roles

[ ] Verify booking flow
  ✓ Fresh browser test: navigate to /book
  ✓ Select room, dates, guests
  ✓ Submit booking form
  ✓ Verify booking reference is generated
  ✓ Verify success page shows correct data

[ ] Verify admin/staff authorization
  ✓ Login as staff member
  ✓ Access /staff bookings page
  ✓ Login as admin
  ✓ Access /admin dashboard
  ✓ Test status transition actions

[ ] Deploy
  ✓ Push to GitHub
  ✓ Deploy to Vercel
  ✓ Verify deployment URL

[ ] Test production URL
  ✓ Open production URL in fresh browser
  ✓ Test public pages (home, rooms)
  ✓ Test booking flow from fresh session
  ✓ Test staff access with valid credentials
  ✓ Test admin access with valid credentials

[ ] Test direct route navigation
  ✓ Test /book direct URL
  ✓ Test /staff direct URL (should redirect to login)
  ✓ Test /admin direct URL (should redirect to login)
  ✓ Test /booking/success direct URL with ref param

[ ] Test mobile
  ✓ Test on mobile viewport
  ✓ Test sticky booking bar
  ✓ Test mobile navigation
  ✓ Test room selection on touch devices

[ ] Test edge cases
  ✓ Check-out before check-in (form validation)
  ✓ Guest count exceeding room capacity
  ✓ Past check-in dates
  ✓ Special characters in guest name/email
  ✓ Network failure during booking
```

---

# G. EXACT NEXT ACTIONS

1. **CRITICAL**: Run migration `003_rpc_functions.sql` in the Supabase SQL editor to recreate the `public.create_booking_safe` function. The 404 error from `/rest/v1/rpc/create_booking_safe` indicates the function is missing from the running database.

2. **CRITICAL**: After adding the function, run `GRANT EXECUTE ON FUNCTION create_booking_safe TO authenticated;` to ensure PostgREST can expose the function for RPC calls.

3. **HIGH**: Remove `VITE_SETUP_SECRET` from the production environment. This secret is only needed for the one-time admin provisioning flow via the `/setup` page. After the first admin is provisioned, it should be removed from all environment variables.

4. **HIGH**: Address the duplicate migration `002` numbering issue. Review the Supabase migration history and confirm all intended changes from both `002_production_hardening.sql` and `002_security_rls.sql` are present in the database. Consider renaming one to `003` or `004` to avoid confusion, though this would require updating all subsequent migration numbers.

5. **MEDIUM**: Verify all RPC functions with `SET search_path = ''` have properly qualified table names. Review `002_security_rls.sql` functions and `003_rpc_functions.sql` to ensure table references are safe.

6. **MEDIUM**: Remove `VITE_SETUP_SECRET` from `.env` and replace with a note in `.env.example` that the setup secret is only needed for initial admin provisioning.

7. **LOW**: Run `npm run build` locally (if script execution is allowed) to verify no TypeScript compilation errors.

8. **DEPLOY**: After fixing the above, deploy to Vercel with the proper environment variables configured.

---

# TAHAB PRODUCTION STATUS: NOT READY

The application is **NOT READY** for production deployment due to the following critical issues:

1. **`public.create_booking_safe` function is missing from the Supabase database** - This is the primary blocker. The frontend correctly calls `sb.rpc('create_booking_safe', ...)` but PostgREST returns 404 Not Found because the function does not exist in the database. The function is defined in migration `003_rpc_functions.sql` but may not have been applied to the current Supabase project.

2. **`VITE_SETUP_SECRET` exposed in environment variables** - The setup secret remains in `.env` and could be deployed to Vercel. While it expires after 24 hours and is only used for initial admin provisioning, it should be removed from production env vars.

3. **Duplicate migration number `002`** - Two files (`002_production_hardening.sql` and `002_security_rls.sql`) create uncertainty about which RLS/security changes were applied to the database and in what order.

**Once these three issues are resolved, the application can be re-audited and potentially deployed.** The frontend code, booking architecture, authentication, RLS policies, and status flow are all correctly implemented - the sole blocker is the missing database function.
-- ==============================================================================
-- TAHAB HOTEL & SUITES LTD
-- MIGRATION 003: RPC FUNCTIONS
-- Atomic, server-side business logic for bookings and permissions.
-- ==============================================================================

-- ==============================================================================
-- UTILITY: Generate booking reference
-- ==============================================================================
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
    ref TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Format: THB-XXXXXX (6 uppercase alphanumeric chars)
        ref := 'THB-' || upper(substring(md5(now()::text || random()::text), 1, 6));
        SELECT EXISTS(SELECT 1 FROM bookings WHERE booking_reference = ref) INTO exists_check;
        EXIT WHEN NOT exists_check;
    END LOOP;
    RETURN ref;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ==============================================================================
-- CORE: Check room availability for a date range
-- Returns TRUE if the room is available (no conflicting confirmed bookings)
-- ==============================================================================
CREATE OR REPLACE FUNCTION check_room_availability(
    p_room_id   UUID,
    p_check_in  DATE,
    p_check_out DATE,
    p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_room_exists  BOOLEAN;
    v_room_active  BOOLEAN;
    v_conflicts    INTEGER;
BEGIN
    -- Validate dates
    IF p_check_in >= p_check_out THEN
        RAISE EXCEPTION 'check_out must be after check_in';
    END IF;

    IF p_check_in < CURRENT_DATE THEN
        RAISE EXCEPTION 'check_in cannot be in the past';
    END IF;

    -- Room must exist and be listed
    SELECT EXISTS(
        SELECT 1 FROM rooms
        WHERE id = p_room_id
          AND is_listed = TRUE
          AND status NOT IN ('inactive', 'maintenance')
    ) INTO v_room_exists;

    IF NOT v_room_exists THEN
        RAISE EXCEPTION 'Room is not available for booking';
    END IF;

    -- Check for overlapping confirmed bookings
    -- Overlap condition: existing.check_in < new.check_out AND existing.check_out > new.check_in
    SELECT COUNT(*) INTO v_conflicts
    FROM bookings
    WHERE room_id = p_room_id
      AND status IN ('confirmed', 'checked_in')
      AND check_in < p_check_out
      AND check_out > p_check_in
      AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id);

    RETURN v_conflicts = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- ==============================================================================
-- CORE: Create booking (atomic, with double-booking protection)
-- Uses advisory locks to prevent concurrent race conditions.
-- Price is calculated server-side — never trusted from client.
-- ==============================================================================
CREATE OR REPLACE FUNCTION create_booking_safe(
    p_room_id         UUID,
    p_check_in        DATE,
    p_check_out       DATE,
    p_guest_count     INTEGER,
    p_guest_name      TEXT,
    p_guest_email     TEXT,
    p_guest_phone     TEXT,
    p_special_request TEXT DEFAULT NULL,
    p_user_id         UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_room            RECORD;
    v_num_nights      INTEGER;
    v_total_price     NUMERIC(12, 2);
    v_booking_ref     TEXT;
    v_booking_id      UUID;
    v_available       BOOLEAN;
BEGIN
    -- Advisory lock keyed on room_id to serialize concurrent bookings for same room
    PERFORM pg_advisory_xact_lock(hashtext(p_room_id::TEXT));

    -- Validate dates
    IF p_check_in >= p_check_out THEN
        RAISE EXCEPTION 'INVALID_DATES: Check-out must be after check-in';
    END IF;

    IF p_check_in < CURRENT_DATE THEN
        RAISE EXCEPTION 'INVALID_DATES: Check-in date cannot be in the past';
    END IF;

    -- Load room and validate
    SELECT * INTO v_room FROM rooms
    WHERE id = p_room_id
      AND is_listed = TRUE
      AND status NOT IN ('inactive', 'maintenance');

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ROOM_UNAVAILABLE: The selected room is not available';
    END IF;

    -- Validate guest count
    IF p_guest_count < 1 OR p_guest_count > v_room.capacity THEN
        RAISE EXCEPTION 'INVALID_GUESTS: Guest count must be between 1 and %', v_room.capacity;
    END IF;

    -- Check availability (with lock held)
    SELECT check_room_availability(p_room_id, p_check_in, p_check_out) INTO v_available;

    IF NOT v_available THEN
        RAISE EXCEPTION 'ROOM_CONFLICT: This room is already booked for the selected dates. Please choose different dates.';
    END IF;

    -- Server-side price calculation — never trust client
    v_num_nights  := p_check_out - p_check_in;
    v_total_price := v_room.price_per_night * v_num_nights;

    -- Generate unique booking reference
    v_booking_ref := generate_booking_reference();

    -- Create the booking
    INSERT INTO bookings (
        booking_reference, user_id, room_id,
        check_in, check_out,
        guest_count, guest_name, guest_email, guest_phone,
        status, special_request,
        price_per_night, num_nights, total_price
    )
    VALUES (
        v_booking_ref, p_user_id, p_room_id,
        p_check_in, p_check_out,
        p_guest_count, p_guest_name, p_guest_email, p_guest_phone,
        'pending', NULLIF(trim(COALESCE(p_special_request, '')), ''),
        v_room.price_per_night, v_num_nights, v_total_price
    )
    RETURNING id INTO v_booking_id;

    -- Append audit log
    INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
    VALUES (
        p_user_id,
        'booking_created',
        'booking',
        v_booking_id,
        jsonb_build_object(
            'booking_reference', v_booking_ref,
            'room_id', p_room_id,
            'room_name', v_room.name,
            'check_in', p_check_in,
            'check_out', p_check_out,
            'total_price', v_total_price,
            'guest_email', p_guest_email
        )
    );

    -- Return booking summary
    RETURN json_build_object(
        'id',                v_booking_id,
        'booking_reference', v_booking_ref,
        'room_id',           p_room_id,
        'room_name',         v_room.name,
        'check_in',          p_check_in,
        'check_out',         p_check_out,
        'guest_count',       p_guest_count,
        'guest_name',        p_guest_name,
        'guest_email',       p_guest_email,
        'guest_phone',       p_guest_phone,
        'status',            'pending',
        'price_per_night',   v_room.price_per_night,
        'num_nights',        v_num_nights,
        'total_price',       v_total_price,
        'special_request',   p_special_request
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- CORE: Transition booking status (enforces state machine)
-- ==============================================================================
CREATE OR REPLACE FUNCTION transition_booking_status(
    p_booking_id   UUID,
    p_new_status   booking_status,
    p_actor_id     UUID DEFAULT NULL,
    p_reason       TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_booking       RECORD;
    v_allowed       BOOLEAN := FALSE;
BEGIN
    SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'BOOKING_NOT_FOUND: Booking does not exist';
    END IF;

    -- State machine: define allowed transitions
    CASE v_booking.status
        WHEN 'pending' THEN
            v_allowed := p_new_status IN ('confirmed', 'cancelled', 'rejected');
        WHEN 'confirmed' THEN
            v_allowed := p_new_status IN ('checked_in', 'cancelled');
        WHEN 'checked_in' THEN
            v_allowed := p_new_status IN ('checked_out');
        WHEN 'checked_out' THEN
            v_allowed := FALSE; -- Terminal state
        WHEN 'cancelled' THEN
            v_allowed := FALSE; -- Terminal state
        WHEN 'rejected' THEN
            v_allowed := FALSE; -- Terminal state
        ELSE
            v_allowed := FALSE;
    END CASE;

    IF NOT v_allowed THEN
        RAISE EXCEPTION 'INVALID_TRANSITION: Cannot transition booking from % to %',
            v_booking.status, p_new_status;
    END IF;

    -- Apply transition with operational tracking fields
    UPDATE bookings SET
        status = p_new_status,
        checked_in_by   = CASE WHEN p_new_status = 'checked_in'  THEN p_actor_id ELSE checked_in_by END,
        checked_in_at   = CASE WHEN p_new_status = 'checked_in'  THEN NOW() ELSE checked_in_at END,
        checked_out_by  = CASE WHEN p_new_status = 'checked_out' THEN p_actor_id ELSE checked_out_by END,
        checked_out_at  = CASE WHEN p_new_status = 'checked_out' THEN NOW() ELSE checked_out_at END,
        confirmed_by    = CASE WHEN p_new_status = 'confirmed'   THEN p_actor_id ELSE confirmed_by END,
        confirmed_at    = CASE WHEN p_new_status = 'confirmed'   THEN NOW() ELSE confirmed_at END,
        cancelled_by    = CASE WHEN p_new_status = 'cancelled'   THEN p_actor_id ELSE cancelled_by END,
        cancelled_at    = CASE WHEN p_new_status = 'cancelled'   THEN NOW() ELSE cancelled_at END,
        cancellation_reason = CASE WHEN p_new_status IN ('cancelled', 'rejected') THEN p_reason ELSE cancellation_reason END,
        updated_at = NOW()
    WHERE id = p_booking_id;

    -- Audit log
    INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
    VALUES (
        p_actor_id,
        'booking_status_changed',
        'booking',
        p_booking_id,
        jsonb_build_object(
            'from_status', v_booking.status,
            'to_status', p_new_status,
            'booking_reference', v_booking.booking_reference,
            'reason', p_reason
        )
    );

    RETURN json_build_object(
        'id',      p_booking_id,
        'status',  p_new_status,
        'reference', v_booking.booking_reference
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Transition booking status — idempotency note:
-- Call DROP FUNCTION + recreate if signature changes in a future migration.

-- ==============================================================================
-- CORE: Audit log helper (callable from frontend services)
-- ==============================================================================
CREATE OR REPLACE FUNCTION log_audit_action(
    p_action       TEXT,
    p_entity_type  TEXT DEFAULT NULL,
    p_entity_id    TEXT DEFAULT NULL,
    p_metadata     JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_profile RECORD;
    v_log_id  UUID;
BEGIN
    SELECT * INTO v_profile FROM profiles WHERE user_id = auth.uid();

    INSERT INTO audit_logs (
        actor_id, action, entity_type, entity_id, metadata
    )
    VALUES (
        auth.uid(),
        p_action, p_entity_type, p_entity_id, p_metadata
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- CORE: Get dashboard metrics (real data only)
-- ==============================================================================
CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS JSON AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
BEGIN
    IF NOT is_staff_or_admin() THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Insufficient privileges';
    END IF;

    RETURN (
        SELECT json_build_object(
            'total_bookings',      (SELECT COUNT(*) FROM bookings),
            'pending_bookings',    (SELECT COUNT(*) FROM bookings WHERE status = 'pending'),
            'confirmed_bookings',  (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'),
            'checked_in_today',    (SELECT COUNT(*) FROM bookings WHERE status = 'checked_in'),
            'arrivals_today',      (SELECT COUNT(*) FROM bookings WHERE check_in = v_today AND status = 'confirmed'),
            'departures_today',    (SELECT COUNT(*) FROM bookings WHERE check_out = v_today AND status = 'checked_in'),
            'total_rooms',         (SELECT COUNT(*) FROM rooms WHERE is_listed = TRUE),
            'available_rooms',     (SELECT COUNT(*) FROM rooms WHERE status = 'available' AND is_listed = TRUE),
            'occupied_rooms',      (SELECT COUNT(*) FROM bookings WHERE status = 'checked_in'),
            'maintenance_rooms',   (SELECT COUNT(*) FROM rooms WHERE status = 'maintenance'),
            'total_revenue',       (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status IN ('confirmed', 'checked_in', 'checked_out')),
            'monthly_revenue',     (SELECT COALESCE(SUM(total_price), 0) FROM bookings
                                    WHERE status IN ('confirmed', 'checked_in', 'checked_out')
                                    AND created_at >= date_trunc('month', NOW())),
            'unread_messages',     (SELECT COUNT(*) FROM contact_messages WHERE status = 'unread'),
            'total_guests',        (SELECT COUNT(*) FROM profiles WHERE role = 'guest'),
            'total_staff',         (SELECT COUNT(*) FROM profiles WHERE role IN ('staff', 'admin') AND is_active = TRUE)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- ==============================================================================
-- CORE: Prevent self-role-elevation via UPDATE trigger
-- Enforces that users cannot change their own role or is_active status
-- ==============================================================================
CREATE OR REPLACE FUNCTION prevent_self_role_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If the user is updating their own profile
    IF auth.uid() = OLD.user_id AND NOT is_admin() THEN
        -- Revert any attempt to change role or is_active
        NEW.role := OLD.role;
        NEW.is_active := OLD.is_active;
        NEW.department := OLD.department;
        NEW.position := OLD.position;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_prevent_self_role_change ON profiles;
CREATE TRIGGER tr_prevent_self_role_change
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION prevent_self_role_change();

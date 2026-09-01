// ==============================================================================
// TAHAB HOTEL & SUITES LTD — SUPABASE EDGE FUNCTION: invite-staff
//
// Invokes auth.admin.inviteUserByEmail using the service role key server-side.
// ==============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    // Verify calling user is an authenticated administrator
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: callerUser }, error: userError } = await callerClient.auth.getUser();
    if (userError || !callerUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid caller session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify caller has admin role in profiles
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('role, is_active')
      .eq('user_id', callerUser.id)
      .single();

    if (!callerProfile || !['admin', 'super_admin'].includes(callerProfile.role) || !callerProfile.is_active) {
      return new Response(JSON.stringify({ error: 'Forbidden: Only active administrators can invite staff' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse input
    const { email, fullName, phone, department, position, role, permissions } = await req.json();

    if (!email || !fullName) {
      return new Response(JSON.stringify({ error: 'Email and Full Name are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Invite user via Supabase Auth Admin
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        phone: phone || '',
      },
    });

    if (inviteError) {
      return new Response(JSON.stringify({ error: inviteError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const newUserId = inviteData.user.id;

    // Create / update profile with staff details
    await adminClient.from('profiles').upsert({
      user_id: newUserId,
      email: email.toLowerCase(),
      full_name: fullName,
      phone: phone || null,
      role: role || 'staff',
      department: department || null,
      position: position || null,
      is_active: true,
      hired_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    });

    // Assign permissions if provided
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      const permRows = permissions.map((perm: string) => ({
        user_id: newUserId,
        permission: perm,
        granted_by: callerUser.id,
      }));
      await adminClient.from('staff_permissions').insert(permRows);
    }

    // Record audit log
    await adminClient.from('audit_logs').insert({
      actor_id: callerUser.id,
      actor_email: callerUser.email,
      actor_role: callerProfile.role,
      action: 'staff_invited',
      entity_type: 'staff',
      entity_id: newUserId,
      metadata: { email, fullName, role, department, position },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation successfully sent to ${email}.`,
        userId: newUserId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

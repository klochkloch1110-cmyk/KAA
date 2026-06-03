import { createClient } from "https://esm.sh/@supabase/supabase-js@2.106.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: "Edge Function env is not configured" }, 500);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerData, error: callerError } = await userClient.auth.getUser();
    if (callerError || !callerData.user) return json({ error: "Unauthorized" }, 401);

    const { data: callerProfile, error: profileError } = await adminClient
      .from("users")
      .select("role")
      .eq("id", callerData.user.id)
      .single();
    if (profileError) return json({ error: profileError.message }, 500);
    if (!['admin', 'operator'].includes(callerProfile.role)) return json({ error: "Forbidden" }, 403);

    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const fullName = String(body.fullName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const licenseNumber = String(body.licenseNumber ?? "").trim();
    const employmentDate = String(body.employmentDate ?? new Date().toISOString().slice(0, 10));
    const note = String(body.note ?? "").trim();

    if (!email || !password || !fullName || !phone) return json({ error: "Missing required fields" }, 400);
    if (password.length < 6) return json({ error: "Password must be at least 6 characters" }, 400);

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "driver", full_name: fullName, phone },
    });
    if (createError) return json({ error: createError.message }, 400);
    const userId = created.user.id;

    const { error: userError } = await adminClient.from("users").upsert({
      id: userId,
      role: "driver",
      full_name: fullName,
      phone,
      email,
      status: "active",
    });
    if (userError) return json({ error: userError.message }, 500);

    const { error: profileInsertError } = await adminClient.from("driver_profiles").upsert({
      user_id: userId,
      license_number: licenseNumber,
      employment_date: employmentDate,
      notes: note || null,
    }, { onConflict: "user_id" });
    if (profileInsertError) return json({ error: profileInsertError.message }, 500);

    return json({ id: userId });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

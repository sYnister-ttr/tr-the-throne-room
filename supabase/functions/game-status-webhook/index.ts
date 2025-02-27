
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, x-api-key, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API key from request headers
    const apiKey = req.headers.get('x-api-key');
    
    // Simple validation - you should replace this with your actual API key
    if (!apiKey || apiKey !== Deno.env.get("WEBHOOK_API_KEY")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    console.log("Received webhook data:", body);

    // Check the type of update
    if (body.type === "terror_zone") {
      // Calculate expiration time (usually 1 hour from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      
      const { error } = await supabaseClient
        .from('terror_zones')
        .insert({
          zone_name: body.zone_name,
          server: body.server,
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;
    } 
    else if (body.type === "dclone") {
      const { error } = await supabaseClient
        .from('dclone_status')
        .insert({
          region: body.region,
          status: body.status,
          progress: body.progress
        });

      if (error) throw error;
    }
    else {
      return new Response(
        JSON.stringify({ error: "Unknown update type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

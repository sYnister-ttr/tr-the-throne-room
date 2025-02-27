
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get webhook secret from request headers
    const signature = req.headers.get('x-signature-ed25519');
    const timestamp = req.headers.get('x-signature-timestamp');
    
    // For Discord webhook validation
    if (!signature || !timestamp) {
      console.log("Received webhook without Discord signatures");
    }

    const body = await req.json();
    console.log("Received Discord webhook data:", body);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse the Discord message content
    const content = body.content || (body.embeds && body.embeds[0]?.description);
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: "No content found in webhook" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if it's a terror zone message
    if (content.toLowerCase().includes("terror zone") || content.toLowerCase().includes("terrorzone")) {
      // Extract zone name using regex - adjust pattern based on your bot's message format
      const zoneMatch = content.match(/zone(?:\s+is)?[:\s]+([^()\n]+)/i);
      const serverMatch = content.match(/(?:server|realm)[:\s]+([^\n]+)/i);
      
      if (zoneMatch && serverMatch) {
        const zoneName = zoneMatch[1].trim();
        const server = serverMatch[1].trim();
        
        // Calculate expiration time (1 hour from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        
        const { error } = await supabaseClient
          .from('terror_zones')
          .insert({
            zone_name: zoneName,
            server: server,
            expires_at: expiresAt.toISOString()
          });

        if (error) throw error;
      }
    }
    // Check if it's a DClone message
    else if (content.toLowerCase().includes("diablo") || content.toLowerCase().includes("dclone")) {
      // Extract status info - adjust patterns based on your bot's message format
      const regionMatch = content.match(/(?:region|realm)[:\s]+([^\n]+)/i);
      const statusMatch = content.match(/(?:status|progress)[:\s]+(\d+)\/6/i);
      const progressMatch = content.match(/(?:description|state)[:\s]+([^\n]+)/i);
      
      if (regionMatch && statusMatch) {
        const { error } = await supabaseClient
          .from('dclone_status')
          .insert({
            region: regionMatch[1].trim(),
            status: parseInt(statusMatch[1]),
            progress: progressMatch ? progressMatch[1].trim() : `Status ${statusMatch[1]}/6`
          });

        if (error) throw error;
      }
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  console.log('=== TEST NO AUTH FUNCTION ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  try {
    const body = await req.json();
    console.log('Body:', body);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Function working without auth!',
      received: body,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info, x-supabase-auth",
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.log('Error:', error.message);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info, x-supabase-auth",
        "Content-Type": "application/json"
      }
    });
  }
});

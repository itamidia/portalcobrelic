import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

console.log('DEBUG FUNCTION: Module loaded');

serve(async (req) => {
  try {
    console.log('=== DEBUG SIMPLE FUNCTION ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers received:', Object.fromEntries(req.headers.entries()));
    
    const response = new Response(JSON.stringify({
      success: true,
      message: 'Debug function working!',
      method: req.method,
      url: req.url,
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
    
    console.log('Response created successfully');
    return response;
  } catch (error) {
    console.log('Error in function:', error.message);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
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

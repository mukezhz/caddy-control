import { healthScheduler } from "../../_services/health/health-scheduler";

/**
 * API route handler for manually triggering health checks
 */
export async function GET() {
  try {
    // Start the health check scheduler if not already running
    await healthScheduler.start();
    
    return new Response(JSON.stringify({ 
      message: 'Health check scheduler started successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error starting health check scheduler:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to start health check scheduler' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

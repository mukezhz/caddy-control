import { healthChecker } from './health-checker';

/**
 * HealthCheckScheduler manages periodic health checks for domains
 */
export class HealthCheckScheduler {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  constructor() {
    // Initialize in stopped state
    this.isRunning = false;
  }

  /**
   * Start the scheduler
   */
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    console.log('Starting health check scheduler');
    this.isRunning = true;
    
    // Run immediate health check
    await this.runAndScheduleChecks();
    
    // Set up a global ticker every minute to check if new domains need health checks
    const globalTimer = setInterval(() => {
      this.runAndScheduleChecks().catch(err => {
        console.error('Error running scheduled health checks:', err);
      });
    }, 60 * 1000); // Check every minute
    
    this.timers.set('global', globalTimer);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) return;
    
    console.log('Stopping health check scheduler');
    this.isRunning = false;
    
    // Clear all timers
    this.timers.forEach((timer, key) => {
      clearInterval(timer);
      this.timers.delete(key);
    });
  }

  /**
   * Run health checks and schedule domain-specific checks based on their intervals
   */
  private async runAndScheduleChecks(): Promise<void> {
    try {
      // Get domains with health check configurations
      const domains = await healthChecker.getDomainsWithHealthCheck();
      
      // Run health checks for all domains
      await healthChecker.runHealthChecks();
      
      // Set up individual timers for each domain based on their interval
      domains.forEach(domain => {
        // Skip domains without valid interval
        if (!domain.healthCheckInterval || domain.healthCheckInterval <= 0) return;
        
        // Clear existing timer for this domain
        if (this.timers.has(domain.id)) {
          clearTimeout(this.timers.get(domain.id));
        }
        
        // Set new timer for this domain
        const intervalMs = domain.healthCheckInterval * 1000;
        const timer = setTimeout(async () => {
          await healthChecker.checkHealth(domain).catch(err => {
            console.error(`Error checking health for ${domain.incomingAddress}:`, err);
          });
          
          // Re-schedule after completion
          if (this.isRunning) {
            this.timers.delete(domain.id); // Remove expired timer
            this.runAndScheduleChecks();   // Schedule next round
          }
        }, intervalMs);
        
        // Store timer reference
        this.timers.set(domain.id, timer);
      });
    } catch (error) {
      console.error('Error scheduling health checks:', error);
    }
  }
}

// Export singleton instance
export const healthScheduler = new HealthCheckScheduler();

import { PrismaClient } from '@prisma/client';
import prisma from '../../../../lib/prisma';

/**
 * Health Check Service for proxies
 * Instead of relying on Caddy for health checks, this service will perform health checks
 * on configured domains and update their health status in the database
 */
export class HealthCheckService {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = prisma;
  }

  /**
   * Get all domains that have health check configurations
   */
  async getDomainsWithHealthCheck() {
    return this.prisma.domains.findMany({
      where: {
        healthCheckUrl: { not: null },
      },
    });
  }

  /**
   * Check health for a specific domain
   */
  async checkHealth(domain: {
    id: string;
    incomingAddress: string;
    healthCheckUrl?: string | null;
    healthCheckMethod?: string | null;
    healthCheckInterval?: number | null;
    enableHttps: boolean;
  }) {
    if (!domain.healthCheckUrl) return null;

    const protocol = domain.enableHttps ? 'https' : 'http';
    const url = `${protocol}://${domain.incomingAddress}${domain.healthCheckUrl}`;
    const method = domain.healthCheckMethod || 'GET';
    const timeout = 5000; // 5 seconds timeout

    try {
      console.log(`Checking health for ${domain.incomingAddress} (${url})`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const isHealthy = response.ok;
      const now = new Date();
      
      // Update domain health status in database
      await this.prisma.domains.update({
        where: { id: domain.id },
        data: {
          lastHealthStatus: isHealthy,
          lastCheckedAt: now
        }
      });
      
      return {
        domainId: domain.id,
        isHealthy,
        statusCode: response.status,
        checkedAt: now
      };
    } catch (error: any) {
      // Handle network errors or timeouts
      console.error(`Health check failed for ${domain.incomingAddress}:`, error.message);
      
      await this.prisma.domains.update({
        where: { id: domain.id },
        data: {
          lastHealthStatus: false,
          lastCheckedAt: new Date()
        }
      });
      
      return {
        domainId: domain.id,
        isHealthy: false,
        error: error.message,
        checkedAt: new Date()
      };
    }
  }

  /**
   * Run health checks for all configured domains
   */
  async runHealthChecks() {
    const domains = await this.getDomainsWithHealthCheck();
    console.log(`Running health checks for ${domains.length} domains`);
    
    const results = await Promise.all(
      domains.map(domain => this.checkHealth(domain))
    );
    
    return results.filter(Boolean);
  }
}

// Export a singleton instance
export const healthChecker = new HealthCheckService();

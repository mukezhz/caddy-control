import { DomainWithCheckResults } from "../../domain/domain-types";

interface HealthCheckOptions {
  method: string;
  url: string;
  timeout?: number;
}

/**
 * Check the health status of a proxy service
 * @param domain The domain to check
 * @returns Health check result with status and description
 */
export const checkProxyHealth = async (domain: string, path = '/health', method = 'GET', timeout = 5000) => {
  try {
    // Default health check result
    let result = false;
    let description = 'Health check failed or not configured';
    let lastChecked = new Date().toISOString();

    // Skip health check if no domain
    if (!domain) {
      return { result, description, lastChecked };
    }

    const protocol = 'https';
    const healthUrl = `${protocol}://${domain}${path}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(healthUrl, {
        method,
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        result = true;
        description = `Health check succeeded (${response.status})`;
      } else {
        description = `Health check failed with status: ${response.status}`;
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        description = `Health check timed out after ${timeout}ms`;
      } else {
        description = `Health check failed: ${error.message}`;
      }
    }

    return { result, description, lastChecked };
  } catch (error) {
    console.error("Error checking proxy health:", error);
    return {
      result: false,
      description: "Error checking health status",
      lastChecked: new Date().toISOString()
    };
  }
};

/**
 * Add health check results to domain check results
 */
export const appendHealthChecksToDomains = async (domains: DomainWithCheckResults[]) => {
  const domainsWithHealth = await Promise.all(
    domains.map(async (domain) => {
      // Get health check configuration from metadata if available (from route.ts)
      const healthCheck = await checkProxyHealth(
        domain.incomingAddress,
        '/health', // Default path if none provided
        'GET' // Default method if none provided
      );
      
      return {
        ...domain,
        checkResults: {
          ...domain.checkResults,
          healthCheck
        }
      };
    })
  );

  return domainsWithHealth;
};

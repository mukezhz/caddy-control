/**
 * Types for Caddy configuration and domain objects
 */

/**
 * Represents a route in a Caddy configuration
 */
export type CaddyRoute = {
  match: Array<{ host: string[] }>;
  handle: any[];
};

/**
 * Represents a parsed domain from Caddy configuration
 */
export type ParsedDomain = {
  incomingAddress: string;
  destinationAddress: string;
  port: number;
  enableHttps: boolean;
  redirectUrl?: string;
  isValid: boolean;
  errorMessage?: string;
};

/**
 * Represents the result of an import operation
 */
export type ImportResult = {
  success: number;
  failed: number;
};
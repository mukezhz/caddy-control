import { toast } from 'sonner';
import { CaddyRoute, ParsedDomain } from '../types/domain.types';

/**
 * Parses a Caddy configuration JSON string and extracts domain information
 * @param configText The Caddy configuration JSON string
 * @returns Array of parsed domains
 */
export const parseCaddyConfig = (configText: string): {
  parsedDomains: ParsedDomain[];
  success: boolean;
  error?: string;
} => {
  try {
    const configData = JSON.parse(configText);
    const extractedDomains: ParsedDomain[] = [];
    
    if (!configData?.apps?.http?.servers?.main?.routes) {
      return { 
        parsedDomains: [], 
        success: false, 
        error: "Invalid Caddy configuration format" 
      };
    }

    const routes = configData.apps.http.servers.main.routes as CaddyRoute[];
    
    routes.forEach(route => {
      if (route.match && Array.isArray(route.match) && route.match.length > 0) {
        const matchBlock = route.match[0];
        
        if (matchBlock.host && Array.isArray(matchBlock.host)) {
          matchBlock.host.forEach(host => {
            try {
              const isRedirect = route.handle?.some(
                h => h.handler === "subroute" && 
                h.routes?.[0]?.handle?.[0]?.handler === "static_response" && 
                h.routes?.[0]?.handle?.[0]?.headers?.Location
              );
              
              let destinationAddress = "";
              let port = 80;
              let enableHttps = true;
              let redirectUrl = undefined;
              
              if (isRedirect) {
                const redirectHandler = route.handle.find(h => 
                  h.handler === "subroute" && 
                  h.routes?.[0]?.handle?.[0]?.handler === "static_response"
                );
                
                const locationHeader = redirectHandler?.routes?.[0]?.handle?.[0]?.headers?.Location?.[0];
                if (locationHeader) {
                  const match = locationHeader.match(/https?:\/\/([^{]+)/);
                  if (match && match[1]) {
                    redirectUrl = match[1];
                    enableHttps = locationHeader.startsWith("https");
                    
                    extractedDomains.push({
                      incomingAddress: host,
                      destinationAddress: "",
                      port: 0,
                      enableHttps,
                      redirectUrl,
                      isValid: true
                    });
                  }
                }
              } else {
                const reverseProxyHandler = route.handle.find(h => 
                  h.handler === "reverse_proxy" ||
                  (h.handler === "subroute" && h.routes?.[0]?.handle?.[0]?.handler === "reverse_proxy")
                );
                
                if (reverseProxyHandler) {
                  let upstreams;
                  
                  if (reverseProxyHandler.handler === "reverse_proxy") {
                    upstreams = reverseProxyHandler.upstreams;
                  } else if (reverseProxyHandler.routes?.[0]?.handle?.[0]?.upstreams) {
                    upstreams = reverseProxyHandler.routes[0].handle[0].upstreams;
                  }
                  
                  if (upstreams && upstreams.length > 0) {
                    const upstream = upstreams[0];
                    if (upstream.dial) {
                      // Extract host:port from dial string
                      const [address, portStr] = upstream.dial.split(':');
                      destinationAddress = address;
                      port = parseInt(portStr, 10);
                      
                      // Check if HTTPS is enabled (by default it is unless explicitly disabled)
                      if (reverseProxyHandler.transport?.protocol === "http") {
                        enableHttps = !(reverseProxyHandler.transport?.tls === undefined);
                      }
                      
                      extractedDomains.push({
                        incomingAddress: host,
                        destinationAddress,
                        port,
                        enableHttps,
                        isValid: true
                      });
                    }
                  }
                }
              }
            } catch (error) {
              extractedDomains.push({
                incomingAddress: host,
                destinationAddress: "",
                port: 0,
                enableHttps: true,
                isValid: false,
                errorMessage: "Failed to parse route configuration"
              });
            }
          });
        }
      }
    });
    
    return { 
      parsedDomains: extractedDomains, 
      success: true 
    };
  } catch (error) {
    return { 
      parsedDomains: [], 
      success: false, 
      error: "Invalid JSON format" 
    };
  }
};
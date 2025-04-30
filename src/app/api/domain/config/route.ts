import { NextRequest, NextResponse } from "next/server";
import { getCaddyConfig } from "../../_services/caddy/caddy-service";
import { getUserFromHeader, hasPermission } from "../../_services/user/user-service";

export async function GET(request: NextRequest) {
  try {
    // Get user from request headers
    const user = await getUserFromHeader(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const path = request.nextUrl.pathname;
    let requiredPermission;
    
    // All paths will use proxy_management permissions
    if (path.includes('/proxies')) {
      requiredPermission = 'proxy_management:manage';
    } else {
      // Default view permission
      requiredPermission = 'proxy_management:view';
    }
    // Fix the permission check - use OR logic instead of AND
    if (!hasPermission(user, requiredPermission)) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const caddyConfig = await getCaddyConfig();
    return NextResponse.json(caddyConfig);
  } catch (error) {
    console.error("Error fetching Caddy configuration:", error);
    return NextResponse.json(
      { error: 'Failed to retrieve Caddy configuration' }, 
      { status: 500 }
    );
  }
}
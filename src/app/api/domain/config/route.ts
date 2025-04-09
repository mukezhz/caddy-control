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
    if (path.includes('/')) {
      requiredPermission = 'dashboard:view';
    }else if (path.includes('/proxies')) {
      requiredPermission = 'proxies:manage';
    } else if (path.includes('/system')) {
      requiredPermission = 'system:manage';
    } else {
      return NextResponse.json(
        { error: "Forbidden - Unknown path" },
        { status: 403 }
      );
    }

    if (!hasPermission(user, requiredPermission) && !user.isAdmin) {
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
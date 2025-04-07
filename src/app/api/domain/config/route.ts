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
    
    // Check if user has permission to view domain configuration
    // This is a more sensitive operation, so require at least proxies:manage or system:manage
    if (!hasPermission(user, "proxies:manage") && 
        !hasPermission(user, "system:manage") && 
        !user.isAdmin) {
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
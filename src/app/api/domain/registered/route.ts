import { NextRequest, NextResponse } from "next/server";
import { checkDomain } from "../../_services/dns/dns-service";
import prisma from "../../../../lib/prisma";
import { DomainWithCheckResults } from "../domain-types";
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
    
    // Check if user has permission to view domains - use OR logic for permissions
    if (!user.isAdmin && 
        !hasPermission(user, "proxy_management:view") && 
        !hasPermission(user, "proxy_management:manage")) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const registeredDomains = await prisma.domains.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    const domainsWithCheckResults: DomainWithCheckResults[] = [];

    for (const domain of registeredDomains) {
      const domainCheckResults = await checkDomain(domain.incomingAddress);
      domainsWithCheckResults.push({
        ...domain,
        redirectUrl: domain?.redirectUrl || undefined,
        checkResults: domainCheckResults,
      });
    }

    return NextResponse.json({
      data: domainsWithCheckResults,
      total: domainsWithCheckResults.length,
    });
  } catch (error) {
    console.error("Error fetching registered domains:", error);
    return NextResponse.json(
      { error: "Failed to retrieve registered domains" },
      { status: 500 }
    );
  }
}
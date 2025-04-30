import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteDomainSchema } from "../domain-schema";
import {
  loadCaddyConfig,
  validateIncomingDomain,
} from "../../_services/caddy/caddy-service";
import prisma from "../../../../lib/prisma";
import { Prisma } from "@prisma/client";
import { getUserFromHeader, hasPermission } from "../../_services/user/user-service";

export async function DELETE(request: NextRequest) {
  try {
    // Get user from request headers
    const user = await getUserFromHeader(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if user has permission to delete domains (requires proxy_management:manage)
    if (!user.isAdmin && !hasPermission(user, "proxy_management:manage")) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const reqBody = await request.json();
    const reqPayload = deleteDomainSchema.parse(reqBody);

    if (reqPayload.incomingAddress === process.env.API_HOST) {
      return NextResponse.json(
        { error: "Unauthorized domain deletion!" },
        { status: 403 }
      );
    }
    const domainDetails = await prisma.domains.findFirst({
      where: {
        incomingAddress: reqPayload.incomingAddress,
      },
    });

    if (!domainDetails) {
      return NextResponse.json(
        { error: "Domain not registered!" },
        { status: 404 }
      );
    }
    if (domainDetails.isLocked) {
      return NextResponse.json(
        { error: "Unauthorized domain deletion!" },
        { status: 404 }
      );
    }

    const { currentConfig, hasExistingRoute } = await validateIncomingDomain(
      reqPayload.incomingAddress
    );

    if (!hasExistingRoute) {
      return NextResponse.json(
        { error: "Domain not registered in caddy!" },
        { status: 404 }
      );
    }

    const newConfigPayload = { ...currentConfig };
    const filteredRoutes =
      newConfigPayload.apps.http.servers.main.routes.filter((route) =>
        route.match.every((ma) => !ma.host.includes(reqPayload.incomingAddress))
      );
    newConfigPayload.apps.http.servers.main.routes = filteredRoutes;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.caddyConfiguration.create({
        data: {
          config: JSON.parse(JSON.stringify(newConfigPayload)),
        },
      });

      await tx.domains.delete({
        where: {
          incomingAddress: reqPayload.incomingAddress,
        },
      });
    });

    await loadCaddyConfig(newConfigPayload);

    return NextResponse.json(
      {
        message: "Domain deleted successfully!",
      },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation Failed",
          details: err.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete domain" },
      { status: 500 }
    );
  }
}

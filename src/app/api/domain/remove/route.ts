import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteDomainSchema } from "../domain-schema";
import {
  loadCaddyConfig,
  validateIncomingDomain,
} from "../../_services/caddy/caddy-service";
import prisma from "@/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const reqPayload = deleteDomainSchema.parse(reqBody);

    if (reqPayload.incomingAddress === process.env.API_HOST) {
      return NextResponse.json(
        { error: "Unauthorized domain deletion" },
        { status: 403 }
      );
    }

    const { currentConfig, hasExistingRoute } = await validateIncomingDomain(
      reqPayload.incomingAddress
    );

    if (!hasExistingRoute) {
      return NextResponse.json(
        { error: "Domain not registered" },
        { status: 404 }
      );
    }

    const newConfigPayload = { ...currentConfig };
    const filteredRoutes =
      newConfigPayload.apps.http.servers.main.routes.filter((route) =>
        route.match.every((ma) => !ma.host.includes(reqPayload.incomingAddress))
      );
    newConfigPayload.apps.http.servers.main.routes = filteredRoutes;
    
    await loadCaddyConfig(newConfigPayload);

    await prisma.$transaction(async (tx) => {
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

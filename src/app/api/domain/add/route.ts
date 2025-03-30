import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addDomainSchema } from "../domain-schema";
import {
  loadCaddyConfig,
  validateIncomingDomain,
} from "../../_services/caddy/caddy-service";
import { getRouteTemplate } from "../../_services/caddy/caddy-templates";
import prisma from "../../../../lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const reqPayload = addDomainSchema.parse(reqBody);

    const { currentConfig, hasExistingRoute } = await validateIncomingDomain(
      reqPayload.incomingAddress
    );

    if (hasExistingRoute) {
      return NextResponse.json(
        { error: "Domain already registered" },
        { status: 409 }
      );
    }

    const parsedPort = Number(reqPayload.port);

    const routeConfig = getRouteTemplate(
      reqPayload.incomingAddress,
      reqPayload.destinationAddress,
      parsedPort,
      reqPayload.enableHttps
    );

    const newConfigPayload = { ...currentConfig };
    newConfigPayload.apps.http.servers.main.routes.push(routeConfig);


    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.caddyConfiguration.create({
        data: {
          config: JSON.parse(JSON.stringify(newConfigPayload)),
        },
      });
      await tx.domains.create({
        data: {
          incomingAddress: reqPayload.incomingAddress,
          destinationAddress: reqPayload.destinationAddress,
          port: parsedPort,
          enableHttps: reqPayload.enableHttps
        },
      });
    });

    await loadCaddyConfig(newConfigPayload);

    return NextResponse.json(
      {
        message: "Domain added successfully!",
      },
      { status: 201 }
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
      { error: "Failed to add domain" },
      { status: 500 }
    );
  }
}

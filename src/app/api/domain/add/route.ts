import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addDomainSchema } from "../domain-schema";
import {
  loadCaddyConfig,
  validateIncomingDomain,
} from "../../_services/caddy/caddy-service";
import {
  getRouteTemplate,
  getRedirectTemplate,
} from "../../_services/caddy/caddy-templates";
import prisma from "../../../../lib/prisma";
import { Prisma } from "@prisma/client";
import {
  getUserFromHeader,
  hasPermission,
} from "../../_services/user/user-service";
import { Resources } from "@/config/resources";

export async function POST(request: NextRequest) {
  try {
    // Get user from request headers
    const user = await getUserFromHeader(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      !hasPermission(user, Resources.WithManage(Resources.PROXY_MANAGEMENT))
    ) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const reqBody = await request.json();
    const reqPayload = addDomainSchema.parse(reqBody);

    // Check if the domain is already registered
    const { currentConfig, hasExistingRoute } = await validateIncomingDomain(
      reqPayload.domain
    );

    if (hasExistingRoute) {
      return NextResponse.json(
        { error: `Domain ${reqPayload.domain} is already registered` },
        { status: 409 }
      );
    }

    if (!currentConfig) {
      return NextResponse.json(
        { error: "Failed to retrieve Caddy config" },
        { status: 500 }
      );
    }

    const parsedPort = reqPayload.port === "" ? null : Number(reqPayload.port);
    const newConfigPayload = { ...currentConfig };

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      console.log("Preparing configuration changes.");

      const existingDomain = await tx.domains.findUnique({
        where: { incomingAddress: reqPayload.domain },
      });

      if (existingDomain) {
        console.log(
          `Domain ${reqPayload.domain} already exists in database, updating...`
        );

        await tx.domains.update({
          where: { incomingAddress: reqPayload.domain },
          data: {
            destinationAddress:
              reqPayload.enableRedirection && reqPayload.redirectTo
                ? reqPayload.redirectTo.trim()
                : reqPayload.destinationAddress,
            port: parsedPort ?? undefined,
            enableHttps: reqPayload.enableHttps,
            redirectUrl:
              reqPayload.enableRedirection && reqPayload.redirectTo
                ? reqPayload.redirectTo.trim()
                : null,
          },
        });
      } else {
        if (
          reqPayload.enableRedirection &&
          reqPayload.redirectTo &&
          reqPayload.redirectTo.trim()
        ) {
          const redirectConfig = getRedirectTemplate(
            reqPayload.domain,
            reqPayload.redirectTo,
            reqPayload.enableHttps
          );
          newConfigPayload.apps.http.servers.main.routes.push(redirectConfig);

          await tx.domains.create({
            data: {
              incomingAddress: reqPayload.domain,
              destinationAddress: reqPayload.redirectTo.trim(),
              port: parsedPort || 0,
              enableHttps: reqPayload.enableHttps,
              redirectUrl: reqPayload.redirectTo.trim(),
            },
          });
        } else {
          const routeConfig = getRouteTemplate(
            reqPayload.domain,
            reqPayload.destinationAddress,
            parsedPort ?? 80,
            reqPayload.enableHttps,
            reqPayload.versions
          );
          newConfigPayload.apps.http.servers.main.routes.push(routeConfig);

          await tx.domains.create({
            data: {
              incomingAddress: reqPayload.domain,
              destinationAddress: reqPayload.destinationAddress,
              port: parsedPort || 0,
              enableHttps: reqPayload.enableHttps,
              redirectUrl: null,
            },
          });
        }
      }

      // Load the updated configuration to Caddy after all changes have been made
      console.log("Saving updated configuration to Caddy.");
      const loadConfigRes = await loadCaddyConfig(newConfigPayload);
      console.log("Loaded Caddy config: ", loadConfigRes);

      // Save the configuration to the database after successful Caddy update
      const createResponse = await tx.caddyConfiguration.create({
        data: {
          config: JSON.parse(JSON.stringify(newConfigPayload)),
        },
      });
      console.log("Caddy configuration created: ", createResponse.id);
    });

    return NextResponse.json(
      {
        message: "Domain added successfully!",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation Failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }
    console.error("error...", error);
    return NextResponse.json(
      { error: "Failed to add domain" },
      { status: 500 }
    );
  }
}

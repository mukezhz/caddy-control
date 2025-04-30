import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addDomainSchema } from "../domain-schema";
import {
  loadCaddyConfig,
  validateIncomingDomain,
} from "../../_services/caddy/caddy-service";
import { getRouteTemplate, getRedirectTemplate } from "../..//_services/caddy/caddy-templates";
import prisma from "../../../../lib/prisma";
import { Prisma } from "@prisma/client";
import { getUserFromHeader, hasPermission } from "../..//_services/user/user-service";
import { Resources } from "@/config/resources";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromHeader(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!hasPermission(user, Resources.WithManage(Resources.PROXY_MANAGEMENT))) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const reqBody = await request.json();
    const reqPayload = addDomainSchema.parse(reqBody);

    const { currentConfig, hasExistingRoute } = await validateIncomingDomain(
      reqPayload.domain
    );

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
      
      if (hasExistingRoute) {
        const routeIndex = newConfigPayload.apps.http.servers.main.routes.findIndex(
          (route: any) => {
            const match = route.match?.find((m: any) => 
              m.host?.includes(reqPayload.domain)
            );
            return !!match;
          }
        );
        
        if (routeIndex !== -1) {
          newConfigPayload.apps.http.servers.main.routes.splice(routeIndex, 1);
          console.log(`Removed existing route for ${reqPayload.domain}`);
        }
      }
      
      const redirectTo = reqPayload.redirectTo || '';
      const isRedirectEnabled = reqPayload.enableRedirection && redirectTo.trim() !== '';
      const destinationOrRedirect = isRedirectEnabled ? 
        redirectTo.trim() : reqPayload.destinationAddress;
      
      if (isRedirectEnabled) {
        const redirectConfig = getRedirectTemplate(
          reqPayload.domain,
          redirectTo.trim(),
          reqPayload.enableHttps
        );
        newConfigPayload.apps.http.servers.main.routes.push(redirectConfig);
      } else {
        const routeConfig = getRouteTemplate(
          reqPayload.domain,
          reqPayload.destinationAddress,
          parsedPort ?? 80,
          reqPayload.enableHttps,
          reqPayload.versions,
        );
        newConfigPayload.apps.http.servers.main.routes.push(routeConfig);
      }
      
      await tx.domains.upsert({
        where: { 
          incomingAddress: reqPayload.domain 
        },
        create: {
          incomingAddress: reqPayload.domain,
          destinationAddress: destinationOrRedirect,
          port: parsedPort || 0,
          enableHttps: reqPayload.enableHttps,
          redirectUrl: isRedirectEnabled ? destinationOrRedirect : null,
        },
        update: {
          destinationAddress: destinationOrRedirect,
          port: parsedPort || 0,
          enableHttps: reqPayload.enableHttps,
          redirectUrl: isRedirectEnabled ? destinationOrRedirect : null,
        }
      });
      
      console.log(`Domain ${reqPayload.domain} upserted in database`);
      
      console.log("Saving updated configuration to Caddy.")
      const loadConfigRes = await loadCaddyConfig(newConfigPayload);
      console.log("Loaded Caddy config: ", loadConfigRes)

      await tx.caddyConfiguration.create({
        data: {
          config: JSON.parse(JSON.stringify(newConfigPayload)),
        },
      });
      console.log("Caddy configuration created and stored");
    });

    const action = hasExistingRoute ? "updated" : "added";
    return NextResponse.json(
      {
        message: `Domain ${action} successfully!`,
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
    console.error("error...", error)
    return NextResponse.json(
      { error: "Failed to add domain" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addDomainSchema } from "../domain-schema";
import {
  loadCaddyConfig,
  validateIncomingDomain,
} from "../../_services/caddy/caddy-service";
import { getRouteTemplate, getRedirectTemplate } from "../../_services/caddy/caddy-templates";
import prisma from "../../../../lib/prisma";
import { Prisma } from "@prisma/client";
import { getUserFromHeader, hasPermission } from "../../_services/user/user-service";
import { HandlerConfig } from "../../_services/caddy/template-types";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Get user from request headers
    const user = await getUserFromHeader(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!hasPermission(user, "proxies:manage") && !hasPermission(user, "proxies:modify")) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const reqBody = await request.json();

    // Replace schema extension with manual merging
    const extendedAddDomainSchema = z.object({
      domain: z.string(),
      enableRedirection: z.boolean().default(false),
      redirectTo: z.string().optional(),
      destinationAddress: z.string(),
      port: z.string(),
      enableHttps: z.boolean().default(true),
      enableAdvancedSettings: z.boolean().optional(),
      basicAuthUsername: z.string().optional(),
      basicAuthPassword: z.string().optional(),
      healthCheckUrl: z.string().optional(),
      healthCheckMethod: z.enum(["GET", "HEAD", "POST", "PUT"]).optional(),
      healthCheckInterval: z.string().optional(),
    });

    const reqPayload = extendedAddDomainSchema.parse(reqBody);

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
      // Create a new Caddy configuration
      await tx.caddyConfiguration.create({
        data: {
          config: JSON.parse(JSON.stringify(newConfigPayload)),
        },
      });

      // Check if domain already exists in database
      const existingDomain = await tx.domains.findUnique({
        where: { incomingAddress: reqPayload.domain }
      });

      if (existingDomain) {
        console.log(`Domain ${reqPayload.domain} already exists in database, updating...`);

        // Update the existing domain
        await tx.domains.update({
          where: { incomingAddress: reqPayload.domain },
          data: {
            destinationAddress: reqPayload.enableRedirection && reqPayload.redirectTo ?
              reqPayload.redirectTo.trim() : reqPayload.destinationAddress,
            port: parsedPort ?? undefined,
            enableHttps: reqPayload.enableHttps,
            redirectUrl: reqPayload.enableRedirection && reqPayload.redirectTo ?
              reqPayload.redirectTo.trim() : null,
          }
        });
      } else {
        // Add new domain configuration based on whether redirection is enabled
        if (reqPayload.enableRedirection && reqPayload.redirectTo && reqPayload.redirectTo.trim()) {
          const redirectConfig = getRedirectTemplate(
            reqPayload.domain,
            reqPayload.redirectTo,
            reqPayload.enableHttps
          );
          newConfigPayload.apps.http.servers.main.routes.push(redirectConfig);

          // Save domain in database with redirection info
          await tx.domains.create({
            data: {
              incomingAddress: reqPayload.domain,
              destinationAddress: reqPayload.redirectTo.trim(),
              port: parsedPort || 0,
              enableHttps: reqPayload.enableHttps,
              redirectUrl: reqPayload.redirectTo.trim() // Store redirection info
            }
          });
        } else {
          // Create a normal proxy route
          const routeConfig = getRouteTemplate(
            reqPayload.domain,
            reqPayload.destinationAddress,
            parsedPort ?? 80,
            reqPayload.enableHttps
          );
          newConfigPayload.apps.http.servers.main.routes.push(routeConfig);

          // Save domain in database without redirection info
          await tx.domains.create({
            data: {
              incomingAddress: reqPayload.domain,
              destinationAddress: reqPayload.destinationAddress,
              port: parsedPort || 0,
              enableHttps: reqPayload.enableHttps,
              redirectUrl: null // No redirection
            }
          });
        }
      }

      // Store health check configuration in the database when creating/updating domains
      const healthCheckData = reqPayload.healthCheckUrl ? {
        healthCheckUrl: reqPayload.healthCheckUrl,
        healthCheckMethod: reqPayload.healthCheckMethod || 'GET',
        healthCheckInterval: reqPayload.healthCheckInterval ? parseInt(reqPayload.healthCheckInterval) : 30,
      } : {};

      await tx.domains.update({
        where: { incomingAddress: reqPayload.domain },
        data: healthCheckData,
      });
    });

    // Update route configurations to include required properties
    if (reqPayload.enableAdvancedSettings) {
      if (reqPayload.basicAuthUsername && reqPayload.basicAuthPassword) {
        // Add basic auth configuration properly structured according to Caddy templates
        const hashedPassword = bcrypt.hashSync(reqPayload.basicAuthPassword, 14);

        const basicAuthConfig: HandlerConfig = {
          handler: "authentication",
          providers: {
            http_basic: {
              accounts: [
          {
            username: reqPayload.basicAuthUsername,
            password: hashedPassword,
          }
              ],
              hash: {
          algorithm: "bcrypt"
              },
              hash_cache: {}
            }
          }
        };
        const mainRouteLen = newConfigPayload.apps.http.servers.main.routes.length;
        newConfigPayload.apps.http.servers.main.routes[mainRouteLen-1].handle[0].routes[0].handle.unshift(basicAuthConfig);
      }
    }

    console.log("New Caddy configuration updated");
    await loadCaddyConfig(newConfigPayload);

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
    console.error("error...", error)
    return NextResponse.json(
      { error: "Failed to add domain" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "../../../../lib/prisma";
import { loadCaddyConfig } from "../../_services/caddy/caddy-service";
import { Prisma } from "@prisma/client";
import type { MainConfig } from "../..//_services/caddy/template-types";
import { getUserFromHeader } from "../..//_services/user/user-service";

// Schema for validation
const importConfigSchema = z.object({
  config: z.object({
    admin: z.object({
      listen: z.string(),
    }).optional(),
    apps: z.object({
      http: z.object({
        servers: z.record(z.any()),
      }),
    }),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromHeader(request);

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = importConfigSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: result.error.errors
        },
        { status: 400 }
      );
    }

    const { config } = result.data;

    try {
      // Store the configuration in the database
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.caddyConfiguration.create({
          data: {
            config: config as any,
          },
        });
      });

      // Apply the configuration to Caddy server
      await loadCaddyConfig(config as MainConfig);

      return NextResponse.json(
        { message: "Configuration imported successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error importing configuration:", error);
      return NextResponse.json(
        { error: "Failed to import configuration" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { addKeySchema, deleteKeySchema } from "./keys-schema";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getUserFromHeader, hasPermission } from "../_services/user/user-service";

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
    
    // Check if user has permission to create API keys (requires api_keys:manage or api_keys:modify)
    if (!hasPermission(user, "api_keys:manage") && !hasPermission(user, "api_keys:modify")) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const reqBody = await request.json();
    const reqPayload = addKeySchema.parse(reqBody);

    await prisma.apiKeys.create({
      data: {
        name: reqPayload.name,
      },
    });

    return NextResponse.json(
      {
        message: "Key created successfully!",
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
      { error: "Failed to create key!" },
      { status: 500 }
    );
  }
}

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
    
    // Check if user has permission to view API keys
    if (!hasPermission(user, "api_keys:view") && 
        !hasPermission(user, "api_keys:manage") && 
        !hasPermission(user, "api_keys:modify")) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const keys = await prisma.apiKeys.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: keys,
      total: keys.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch keys!" },
      { status: 500 }
    );
  }
}

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
    
    // Check if user has permission to delete API keys (requires api_keys:manage or api_keys:modify)
    if (!hasPermission(user, "api_keys:manage") && !hasPermission(user, "api_keys:modify")) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const reqBody = await request.json();
    const reqPayload = deleteKeySchema.parse(reqBody);

    const keyDetails = await prisma.apiKeys.findUnique({
      where: {
        key: reqPayload.key,
      },
    });

    if (!keyDetails) {
      return NextResponse.json({ error: "Key not found!" }, { status: 404 });
    }
    await prisma.apiKeys.deleteMany({
      where: {
        key: reqPayload.key,
      },
    });
    return NextResponse.json(
      {
        message: "Key deleted successfully!",
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

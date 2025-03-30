import { NextRequest, NextResponse } from "next/server";
import { addKeySchema, deleteKeySchema } from "./keys-schema";
import prisma from "@/lib/prisma";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
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

export async function GET() {
  try {
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

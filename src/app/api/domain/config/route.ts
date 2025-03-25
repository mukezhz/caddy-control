import { NextResponse } from "next/server";
import { getCaddyConfig } from "../../_services/caddy/caddy-service";

export async function GET() {
  try {
    const caddyConfig = await getCaddyConfig();
    return NextResponse.json(caddyConfig);
  } catch (err) {
    console.log("error", err)
    return NextResponse.json(
      { error: 'Failed to retrieve Caddy configuration' }, 
      { status: 500 }
    );
  }
}
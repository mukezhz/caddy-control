import { NextRequest, NextResponse } from "next/server";
import { getUserFromHeader } from "../../_services/user/user-service";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromHeader(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
    }
    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Profile retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user profile." },
      { status: 500 }
    );
  }
}

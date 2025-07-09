import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prismaClient } from "@repo/db/client";
import { getToken } from "next-auth/jwt";

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token || !token.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  try {
    const room = await prismaClient.room.create({
      data: {
        slug: body.name,
        adminId: String(token.id),
      },
    });

    return NextResponse.json({ roomId: room.id });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e.message,
        message: "Room already exists with this name",
      },
      { status: 411 }
    );
  }
}

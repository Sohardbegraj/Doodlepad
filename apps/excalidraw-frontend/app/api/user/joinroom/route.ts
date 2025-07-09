import { prismaClient } from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "Room ID is required" }, { status: 400 });
  }

  try {
    const rooms = await prismaClient.room.findMany({
      where: {
        id:Number(id) // ID must be a string or number depending on schema
      },
    });

    return NextResponse.json({ rooms });
  } catch (err) {
    console.error("❌ Error fetching rooms:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// app/api/room/[roomId]/route.ts
import { prismaClient } from "@repo/db/client"; // adjust the path to your prisma client
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest ) {
 const token = await getToken({ req });
 
   if (!token || !token.id) {
     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
   }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    await prismaClient.room.delete({
      where:  {
        id:Number(id) // ID must be a string or number depending on schema
      },
    });

    return NextResponse.json({ message: "Room deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete room:", error);
    return NextResponse.json({ message: "Failed to delete room" }, { status: 500 });
  }
}

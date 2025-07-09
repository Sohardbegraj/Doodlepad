// app/api/user/rooms/route.ts
import { prismaClient } from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";


export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  
    if (!token || !token.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  
  const rooms = await prismaClient.room.findMany({
    where: {
    //@ts-ignore
      adminId: token.id,
    },
  });

  return NextResponse.json({ rooms });
}

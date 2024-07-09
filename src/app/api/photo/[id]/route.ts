import { getPhotoUncached } from "@/app/api/photo/[id]/utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const userId = request.url.substring(request.url.lastIndexOf("/") + 1);
  const data = await getPhotoUncached(userId);

  return new NextResponse(data, {
    status: 200,
  });
}

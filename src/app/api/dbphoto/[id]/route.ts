import {
  cacheUseDatabase,
  canQueryPhoto,
  refreshDatabaseCache,
} from "@/app/api/photo/[id]/utils";
import { getUserPhotoFromDatabase } from "@/prisma/userPhotos.get";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// prisma client cannot run in client components. Using this API route instead.
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await canQueryPhoto())) {
    return new NextResponse(JSON.stringify([]), {
      status: 200,
    });
  }

  const id =
    params?.id ?? request.url.substring(request.url.lastIndexOf("/") + 1);
  let data = await getUserPhotoFromDatabase(id);
  if (!data) {
    data = await getUserPhotoFromDatabase(id, undefined, true);
    if (cacheUseDatabase) {
      refreshDatabaseCache(id);
    }
  }

  return new NextResponse(data, {
    status: 200,
  });
}

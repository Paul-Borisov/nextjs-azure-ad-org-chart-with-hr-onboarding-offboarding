import { getAllUsersUncached } from "./utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const data = await getAllUsersUncached();

  return new NextResponse(JSON.stringify(data), {
    status: 200,
  });
}

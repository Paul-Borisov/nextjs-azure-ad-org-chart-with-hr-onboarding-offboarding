"use server";

import { auth } from "@/auth";
import { generateApiAccessToken } from "@/auth/msal";
import { getSharepointSettings } from "@/shared/lib/sharepointSettings";

const { accessScopes } = getSharepointSettings();

export const getAccessToken = async () => {
  const session = await auth();
  const accessToken = await generateApiAccessToken(
    session?.user.refreshToken as string,
    accessScopes
  ).then((r) => r?.accessToken);
  return accessToken;
};

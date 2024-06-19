import NextAuth, { DefaultSession, Profile } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Profile {
    /** Oauth access token */
    oid?: string & Profile;
  }

  interface Session {
    user: {
      /** Oauth access token */
      userId: string;
      accessToken: string;
      accessTokenExpires: number;
      idToken: string;
      refreshToken: string;
      apiAccessToken: string;
    } & DefaultSession["user"];
  }
}

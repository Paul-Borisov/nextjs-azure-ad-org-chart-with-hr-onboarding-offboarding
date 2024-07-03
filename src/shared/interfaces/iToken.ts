import { JWT } from "next-auth/jwt";

// Used for type validation on property assignments and usage
export interface IToken extends JWT {
  userId: string;
  idToken: string;
  accessToken: string; // Graph Access token
  accessTokenExpires: number;
  refreshToken: string;
}

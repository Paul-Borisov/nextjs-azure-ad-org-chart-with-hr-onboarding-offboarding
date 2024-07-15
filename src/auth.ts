import Entra from "next-auth/providers/microsoft-entra-id";
import { EnvSettings } from "@/shared/lib/envSettings";
import GoogleProvider from "next-auth/providers/google";
import { IToken } from "@/shared/interfaces/iToken";
import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth";
import Utils from "@/shared/lib/utils";

const clientId = EnvSettings.azureAdClientId;
const clientSecret = EnvSettings.azureAdClientSecret;
const tenantId = EnvSettings.azureAdTenantId;
// The actual set of delegated user permissions can vary depending on the access account.
const accessScopes = `openid profile User.Read email offline_access${
  EnvSettings.azureAdPermissions ? ` ${EnvSettings.azureAdPermissions}` : ""
}`;

const authority = `https://login.microsoftonline.com/${tenantId}`;

const refreshAccessToken = async (token: JWT): Promise<IToken> => {
  try {
    const tokenUrl = `${authority}/oauth2/v2.0/token?`;

    let formData = {
      client_id: clientId,
      grant_type: "refresh_token",
      client_secret: clientSecret,
      refresh_token: token.refreshToken,
    };

    const encodeFormData = (data: any) => {
      return Object.keys(data)
        .map(
          (key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
        )
        .join("&");
    };

    const response = await fetch(tokenUrl, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: encodeFormData(formData),
    });

    const tokenInfo = await response.json();

    if (!response.ok) {
      throw tokenInfo;
    }

    return <IToken>{
      ...token,
      idToken: tokenInfo.id_token,
      accessToken: tokenInfo.access_token,
      accessTokenExpires: Date.now() + tokenInfo.expires_in * 1000,
      refreshToken: tokenInfo.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (e) {
    console.error(e);
    return {
      ...(<IToken>token),
      error: "RefreshAccessTokenError",
    };
  }
};

const authenticationProviders = [];
if (clientId && clientSecret && tenantId) {
  authenticationProviders.push(
    Entra({
      // @ts-ignore
      clientId: clientId,
      // @ts-ignore
      clientSecret: clientSecret,
      tenantId: tenantId,
      authorization: {
        params: {
          scope: accessScopes, // Defaults: openid profile User.Read email offline_access; offline_access is required to get refresh token
        },
      },
    })
  );
}
if (EnvSettings.googleClientId && EnvSettings.googleClientSecret) {
  authenticationProviders.push(
    GoogleProvider({
      // @ts-ignore
      clientId: EnvSettings.googleClientId,
      // @ts-ignore
      clientSecret: EnvSettings.googleClientSecret,
    })
  );
}

// https://next-auth.js.org/configuration/options
// It requires an Entra ID App with Web Platform and redirect URL pointing to http://<base-url>/api/auth/callback/azure-ad
// Default permissions: openid profile User.Read email offline_access
export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/signin",
  },

  trustHost: true,

  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },

  providers: authenticationProviders,

  // The secret should be set to a reasonably long random string.
  // It is used to sign cookies and to sign and encrypt JSON Web Tokens, unless
  // a separate secret is defined explicitly for encrypting the JWT.
  secret: EnvSettings.nextAuthSecret,
  //basePath: "/api/auth",

  session: {
    // Use JSON Web Tokens for session instead of database sessions.
    // This option can be used with or without a database for users/accounts.
    // Note: `strategy` should be set to 'jwt' if no database is used.
    // strategy: "jwt", // jwt is the default strategy
    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 60 * 60 * 24 * 2, // 60 * 60 * 24 * 30, // Change to 30 days (default)
    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    // updateAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      // IMPORTANT: Persist the access_token to the token right after sign in
      if (account) {
        token = <IToken>{
          ...token,
          userId: <string>profile?.oid,
          idToken: <string>account.id_token,
          accessToken: <string>account.access_token, // Graph Access token
          accessTokenExpires: <number>account.expires_at * 1000,
          refreshToken: <string>account.refresh_token,
        };
      }

      // @ts-ignore
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }
      if (Utils.isGoogle(token.email)) {
        return token; // No need to get refresh token since we do not query Azure AD with this provider
      }

      return refreshAccessToken(token);
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      // These two custom properties defined in next-auth-d.ts
      // A good discussion about safety of this approach: https://github.com/vercel/next.js/discussions/52006 => Conditionally safe.
      session.user.userId = <string>token.userId;
      session.user.idToken = <string>token.idToken;
      session.user.accessToken = <string>token.accessToken; // Graph Access token
      session.user.accessTokenExpires = <number>token.accessTokenExpires;
      session.user.refreshToken = <string>token.refreshToken;

      return session;
    },
  },
});

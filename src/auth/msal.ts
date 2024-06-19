import { ConfidentialClientApplication, LogLevel } from "@azure/msal-node";
import { EnvSettings } from "@/shared/lib/envSettings";

const clientId = EnvSettings.azureAdClientId;
const clientSecret = EnvSettings.azureAdClientSecret;
const tenantId = EnvSettings.azureAdTenantId;

const authority = `https://login.microsoftonline.com/${tenantId}`;

const config = {
  auth: {
    clientId: clientId,
    authority,
    clientSecret: clientSecret,
    knownAuthorities: [authority],
  },
  system: {
    loggerOptions: {
      // @ts-ignore
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Verbose,
    },
  },
};

//https://github.com/nextauthjs/next-auth/discussions/3006
// @ts-ignore
const cca = new ConfidentialClientApplication(config);
// @ts-ignore
export const generateApiAccessToken = async (
  refreshToken: string,
  scopes: string | string[]
) =>
  await cca
    .acquireTokenByRefreshToken({
      //scopes: [`api://${clientId}/APIScope`],
      scopes: Array.isArray(scopes) ? scopes : [scopes],
      refreshToken,
    })
    .catch((e) => console.error(e));

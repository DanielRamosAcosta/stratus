import * as client from "openid-client";
import { config } from "../core/shared/infrastructure/config";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

type OIDCClient = {
  buildAuthorizationUrl: (
    url: string
  ) => Promise<{ url: string; codeVerifier: string }>;
  authorizationCodeGrant: (
    url: string,
    pkceCodeVerifier: string
  ) => ReturnType<typeof client.authorizationCodeGrant>;
};

let instance: OIDCClient | null = null;

export const oidcInstance = async () => {
  if (!instance) {
    const clientConfig: client.Configuration = await client.discovery(
      new URL(config.OAUTH_ISSUER_URL),
      config.OAUTH_CLIENT_ID,
      config.OAUTH_CLIENT_SECRET
    );

    instance = {
      buildAuthorizationUrl: async (url: string) => {
        console.log("buildAuthorizationUrl", url, config);
        const origin = new URL(url).origin;
        const codeVerifier: string = client.randomPKCECodeVerifier();

        const parameters: Record<string, string> = {
          redirect_uri: new URL("/auth/callback", origin).toString(),
          scope: config.OAUTH_SCOPE,
          code_challenge: await client.calculatePKCECodeChallenge(codeVerifier),
          code_challenge_method: "S256",
          state: client.randomState(),
        };

        const redirectTo = client.buildAuthorizationUrl(
          clientConfig,
          parameters
        );

        return {
          url: redirectTo.toString(),
          codeVerifier,
        };
      },

      authorizationCodeGrant: async (url, pkceCodeVerifier) => {
        console.log("authorizationCodeGrant", url, pkceCodeVerifier, config);
        const fullUrl = new URL(url);
        fullUrl.searchParams.delete("state");
        return await client.authorizationCodeGrant(clientConfig, fullUrl, {
          pkceCodeVerifier,
        });
      },
    } satisfies OIDCClient;
  }

  return instance;
};

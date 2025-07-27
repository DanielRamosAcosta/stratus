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
        // client.tokenIntrospection()

        const parameters: Record<string, string> = {
          redirect_uri: new URL("/auth/callback", origin).toString(),
          scope: config.OAUTH_SCOPE,
          code_challenge: await client.calculatePKCECodeChallenge(codeVerifier),
          code_challenge_method: "S256",
          state: client.randomState(),
        };

        console.log("FULL CONFIG 0", JSON.stringify(clientConfig, null, 2));
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

        console.log("FULL CONFIG 1", JSON.stringify(clientConfig, null, 2));
        const tokens = await client.authorizationCodeGrant(clientConfig, fullUrl, {
          pkceCodeVerifier,
        });
        console.log("tokens", JSON.stringify(tokens, null, 2));

        console.log("FULL CONFIG 2", JSON.stringify(clientConfig, null, 2));
        console.log("going to perform token introspection");
        const result = await client.tokenIntrospection(clientConfig, tokens.access_token)
        console.log("introspection result", JSON.stringify(result, null, 2));

        console.log("going to fetch user info");
        const userInfo = await client.fetchUserInfo(clientConfig, tokens.access_token, result.sub as string);
        console.log("userInfo", JSON.stringify(userInfo, null, 2));

        return tokens;
      },
    } satisfies OIDCClient;
  }

  return instance;
};

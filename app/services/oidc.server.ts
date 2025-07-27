import * as client from "openid-client";
import { config } from "../core/shared/infrastructure/config";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

type OIDCClient = {
  buildAuthorizationUrl: (url: string) => Promise<{ url: string; codeVerifier: string }>;
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
        let state!: string


        let parameters: Record<string, string> = {
          redirect_uri: new URL("/auth/callback", origin).toString(),
          scope: config.OAUTH_SCOPE,
          code_challenge: await client.calculatePKCECodeChallenge(
          codeVerifier,
        ),
          code_challenge_method: "S256",
        }

        if (!clientConfig.serverMetadata().supportsPKCE()) {
          console.log("Server does not support PKCE, using state instead");
          /**
           * We cannot be sure the server supports PKCE so we're going to use state too.
           * Use of PKCE is backwards compatible even if the AS doesn't support it which
           * is why we're using it regardless. Like PKCE, random state must be generated
           * for every redirect to the authorization_endpoint.
           */
          state = client.randomState()
          parameters.state = state
        } else {
          console.log("Server supports PKCE, not using state");
        }
        
        const redirectTo = client.buildAuthorizationUrl(clientConfig, parameters);

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

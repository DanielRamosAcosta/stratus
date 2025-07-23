import * as client from "openid-client";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

type OIDCClient = {
  buildAuthorizationUrl: () => Promise<{ url: string; codeVerifier: string }>;
  authorizationCodeGrant: (
    url: string,
    pkceCodeVerifier: string
  ) => ReturnType<typeof client.authorizationCodeGrant>;
};

let instance: OIDCClient | null = null;

export const oidcInstance = async () => {
  if (!instance) {
    const config: client.Configuration = await client.discovery(
      new URL("https://localhost:5556/dex/.well-known/openid-configuration"),
      "yagd",
      "yagd-secret"
    );

    const redirect_uri = "http://localhost:5173/auth/callback";
    const scope = "openid email profile groups";

    instance = {
      buildAuthorizationUrl: async () => {
        const code_verifier: string = client.randomPKCECodeVerifier();
        const code_challenge: string = await client.calculatePKCECodeChallenge(
          code_verifier
        );

        const redirectTo = client.buildAuthorizationUrl(config, {
          redirect_uri,
          scope,
          code_challenge,
          code_challenge_method: "S256",
        });

        return {
          url: redirectTo.toString(),
          codeVerifier: code_verifier,
        };
      },

      authorizationCodeGrant: async (url, pkceCodeVerifier) => {
        const fullUrl = new URL(url);
        fullUrl.searchParams.delete("state");
        return await client.authorizationCodeGrant(config, fullUrl, {
          pkceCodeVerifier,
        });
      },
    } satisfies OIDCClient;
  }

  return instance;
};

import * as client from "openid-client";
import { config } from "../config";
import { OidcUserInfo } from "../../../users/domain/User";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export class OIDCClient {
  private static instance: OIDCClient;

  private config: client.Configuration;

  private constructor(config: client.Configuration) {
    this.config = config;
  }

  public static async getInstance(): Promise<OIDCClient> {
    if (!OIDCClient.instance) {
      return new OIDCClient(
        await client.discovery(
          new URL(config.OAUTH_ISSUER_URL),
          config.OAUTH_CLIENT_ID,
          config.OAUTH_CLIENT_SECRET
        )
      );
    }
    return OIDCClient.instance;
  }

  async buildAuthorizationUrl(url: string) {
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

    console.log("FULL CONFIG 0", JSON.stringify(this.config, null, 2));
    const redirectTo = client.buildAuthorizationUrl(this.config, parameters);

    return {
      url: redirectTo.toString(),
      codeVerifier,
    };
  }

   async introspectToken(accessToken: string) {
    const result = await client.tokenIntrospection(this.config, accessToken);
    console.log("introspection result", JSON.stringify(result, null, 2));
    return result;
  }

  public async hasExpired(accessToken: string): Promise<boolean> {
    const result = await this.introspectToken(accessToken);
    return result.active === false;
  }

  public async getUserInfo(accessToken: string, sub: string): Promise<OidcUserInfo> {
    return (await client.fetchUserInfo(
      this.config,
      accessToken,
      sub
    )) as OidcUserInfo;
  }

  async authorizationCodeGrant(url: string, pkceCodeVerifier: string) {
    console.log("authorizationCodeGrant", url, pkceCodeVerifier, config);
    const fullUrl = new URL(url);
    fullUrl.searchParams.delete("state");

    return await client.authorizationCodeGrant(this.config, fullUrl, {
      pkceCodeVerifier,
    });
  }
}

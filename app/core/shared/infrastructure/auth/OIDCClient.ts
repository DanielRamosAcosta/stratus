import {Agent, fetch} from 'undici';
import fs from "fs";
import * as client from "openid-client";
import {OidcUserInfo} from "~/core/users/domain/User";
import {config} from "../config";

export class OIDCClient {
  private static instance: OIDCClient;

  private readonly config: client.Configuration;

  private constructor(config: client.Configuration) {
    this.config = config;
  }

  public static async getInstance(): Promise<OIDCClient> {
    if (!OIDCClient.instance) {
      let customFetch = fetch;
      if (config.OAUTH_CERTIFICATE_PATH) {
        const dispatcher = new Agent({
          connect: {
            ca: fs.readFileSync(config.OAUTH_CERTIFICATE_PATH)
          }
        });


        customFetch = (url, options) => {
          return fetch(url, { ...options, dispatcher });
        };
      }

      return new OIDCClient(
        await client.discovery(
          new URL(config.OAUTH_ISSUER_URL),
          config.OAUTH_CLIENT_ID,
          config.OAUTH_CLIENT_SECRET,
          undefined,
        {
          [client.customFetch]: customFetch as unknown as typeof window.fetch
        })
      );
    }
    return OIDCClient.instance;
  }

  async buildAuthorizationUrl(url: string) {
    const origin = new URL(url).origin;
    const codeVerifier: string = client.randomPKCECodeVerifier();

    const parameters: Record<string, string> = {
      redirect_uri: new URL("/auth/callback", origin).toString(),
      scope: config.OAUTH_SCOPE,
      code_challenge: await client.calculatePKCECodeChallenge(codeVerifier),
      code_challenge_method: "S256",
      state: client.randomState(),
    };

    const redirectTo = client.buildAuthorizationUrl(this.config, parameters);

    return {
      url: redirectTo.toString(),
      codeVerifier,
    };
  }

   async introspectToken(accessToken: string) {
     return await client.tokenIntrospection(this.config, accessToken);
  }

  public async getUserInfo(accessToken: string, sub: string): Promise<OidcUserInfo> {
    return (await client.fetchUserInfo(
      this.config,
      accessToken,
      sub
    )) as OidcUserInfo;
  }

  async authorizationCodeGrant(url: string, pkceCodeVerifier: string) {
    const fullUrl = new URL(url);
    fullUrl.searchParams.delete("state");

    return await client.authorizationCodeGrant(this.config, fullUrl, {
      pkceCodeVerifier,
    });
  }
}

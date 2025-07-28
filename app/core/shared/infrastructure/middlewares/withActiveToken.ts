import { redirect } from "@remix-run/node";
import { OIDCClient } from "../auth/OIDCClient";
import { IntrospectionResponse } from "openid-client";
import {sessionStorage} from "~/services/auth.server";

export type WithIntrospection<T> = T & { introspection: IntrospectionResponse };

export async function withActiveToken<T extends { request: Request, accessToken: string }>(
  params: T
): Promise<WithIntrospection<T>> {
  const oidc = await OIDCClient.getInstance();

  const introspection = await oidc.introspectToken(params.accessToken);

  if (!introspection.active) {
    console.log("Access token has expired, redirecting to login");
    const session = await sessionStorage.getSession(params.request.headers.get("cookie"));

    throw redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage.destroySession(session),
      },
    });
  } else {
    console.log("Access token is active");
  }
  
  return {
    ...params,
    introspection,
  };
}

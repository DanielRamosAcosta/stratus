import { redirect } from "@remix-run/node";
import { OIDCClient } from "../auth/OIDCClient";
import { IntrospectionResponse } from "openid-client";

export type WithIntrospection<T> = T & { introspection: IntrospectionResponse };

export async function withActiveToken<T extends { accessToken: string }>(
  params: T
): Promise<WithIntrospection<T>> {

  const oidc = await OIDCClient.getInstance();

  const introspection = await oidc.introspectToken(params.accessToken);

  if (!introspection.active) {
    console.log("Access token has expired, redirecting to login");
    throw redirect("/login");
  }
  
  return {
    ...params,
    introspection,
  };
}

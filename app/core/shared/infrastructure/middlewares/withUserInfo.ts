import { OIDCClient } from "../auth/OIDCClient";
import { IntrospectionResponse } from "openid-client";
import { OidcUserInfo } from "../../../users/domain/User";

export type WithIntrospection<T> = T & { user: OidcUserInfo };

export async function withUserInfo<
  T extends { accessToken: string; introspection: IntrospectionResponse }
>(params: T): Promise<WithIntrospection<T>> {
  const oidc = await OIDCClient.getInstance();

  const user = await oidc.getUserInfo(
    params.accessToken,
    params.introspection.sub as string
  );

  return {
    ...params,
    user,
  };
}

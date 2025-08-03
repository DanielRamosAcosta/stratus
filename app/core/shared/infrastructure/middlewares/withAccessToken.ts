import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { sessionStorage } from "../auth/SessionStorage";

export type WithAccessToken<T> = T & { accessToken: string };

export async function withAccessToken(
  params: ActionFunctionArgs | LoaderFunctionArgs
): Promise<WithAccessToken<ActionFunctionArgs | LoaderFunctionArgs>> {
  const cookie = params.request.headers.get("cookie");
  const session = await sessionStorage.getSession(cookie);
  const accessToken = session.get("access_token");
  if (!accessToken) throw redirect("/login");
  return {
    ...params,
    accessToken,
  };
}

import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { sessionStorage } from "~/services/auth.server";
import { oidcInstance } from "../services/oidc.server";

export async function loader({ request }: LoaderFunctionArgs) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const oidcClient = await oidcInstance()
  const session = await sessionStorage.getSession(request.headers.get("cookie"));

  const tokens = await oidcClient.authorizationCodeGrant(request.url, session.get("code_verifier"))

  session.set("access_token", tokens.access_token);

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

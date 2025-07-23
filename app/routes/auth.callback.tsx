import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import * as client from "openid-client";
import { sessionStorage } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  // Get the URL and search parameters
  const config: client.Configuration = await client.discovery(
    new URL("https://localhost:5556/dex/.well-known/openid-configuration"),
    "yagd",
    "yagd-secret"
  );

  const session = await sessionStorage.getSession(request.headers.get("cookie"));

  const url = new URL(request.url);
  url.searchParams.delete("state");
  const tokens = await client.authorizationCodeGrant(config, url, {
    pkceCodeVerifier: session.get("code_verifier"),
  });

  session.set("access_token", tokens.access_token);

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

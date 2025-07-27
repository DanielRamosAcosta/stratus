import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { sessionStorage } from "~/services/auth.server";
import { oidcInstance } from "../services/oidc.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const oidcClient = await oidcInstance();
    const session = await sessionStorage.getSession(
      request.headers.get("cookie")
    );

    const tokens = await oidcClient.authorizationCodeGrant(
      request.url,
      session.get("code_verifier")
    );

    console.log("tokens", tokens);

    session.set("access_token", tokens.access_token);

    return redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  } catch (error) {
    console.error("Error during OIDC callback:", error);
    throw error;
  }
}

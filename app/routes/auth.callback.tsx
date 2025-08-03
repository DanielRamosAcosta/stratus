import {LoaderFunctionArgs, redirect} from "@remix-run/node";
import {saveFromUserInfo} from "~/core/users/application/SaveFromUserInfo";
import {OIDCClient} from "~/core/shared/infrastructure/auth/OIDCClient";
import {sessionStorage} from "~/core/shared/infrastructure/auth/SessionStorage";

export async function loader({ request }: LoaderFunctionArgs) {
  const oidc = await OIDCClient.getInstance();
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );

  const tokens = await oidc.authorizationCodeGrant(
    request.url,
    session.get("code_verifier")
  );

  console.log("tokens", tokens);

  session.set("access_token", tokens.access_token);

  const introspection = await oidc.introspectToken(tokens.access_token);

  await saveFromUserInfo({
    userInfo: await oidc.getUserInfo(tokens.access_token, introspection.sub as string),
  });

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

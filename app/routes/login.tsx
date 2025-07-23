// app/routes/login.tsx or equivalent route file
import { redirect } from "react-router";
import { data } from "@remix-run/node";
import * as client from "openid-client";
import { sessionStorage } from "~/services/auth.server";

// Import this from correct place for your route
type LoginProps = {
  actionData?: { error?: string };
};

type LoginActionArgs = {
  request: Request;
};

type LoginLoaderArgs = {
  request: Request;
};

// First we create our UI with the form doing a POST and the inputs with
// the names we are going to use in the strategy
export default function Component({ actionData }: LoginProps) {
  return (
    <div>
      <h1>Login</h1>

      {actionData?.error ? (
        <div className="error">{actionData.error}</div>
      ) : null}

      <form method="post">
        <button type="submit">Sign In with SSO</button>
      </form>
    </div>
  );
}

// Second, we need to export an action function, here we will use the
// `authenticator.authenticate` method
export async function action({ request }: LoginActionArgs) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  console.log("Login action called");
  let session = await sessionStorage.getSession(request.headers.get("cookie"));

  try {
    let config: client.Configuration = await client.discovery(
      new URL("https://localhost:5556/dex/.well-known/openid-configuration"),
      "yagd",
      "yagd-secret"
    );

    const redirect_uri = "http://localhost:5173/auth/callback";
    const scope = "openid email profile groups";
    let code_verifier: string = client.randomPKCECodeVerifier();
    let code_challenge: string = await client.calculatePKCECodeChallenge(
      code_verifier
    );

    let parameters: Record<string, string> = {
      redirect_uri,
      scope,
      code_challenge,
      code_challenge_method: "S256",
    };

    let redirectTo: URL = client.buildAuthorizationUrl(config, parameters);

    session.set("code_verifier", code_verifier);

    return redirect(redirectTo.toString(), {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  } catch (error) {
    console.log("Login action error:", error);
    session.flash("error", "Invalid username/password");

    // Redirect back to the login page with errors.
    return redirect("/login", {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  }
}

// Finally, we need to export a loader function to check if the user is already
// authenticated and redirect them to the dashboard
export async function loader({ request }: LoginLoaderArgs) {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let accessToken = session.get("access_token");
  if (accessToken) return redirect("/");
  return data(null);
}

// app/routes/login.tsx or equivalent route file
import { redirect } from "react-router";
import { data } from "@remix-run/node";
import * as client from "openid-client";
import { login, sessionStorage } from "~/services/auth.server";
import { useLoaderData } from "@remix-run/react";

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
    let state!: string;

    let parameters: Record<string, string> = {
      redirect_uri,
      scope,
      code_challenge,
      code_challenge_method: "S256",
    };

    if (!config.serverMetadata().supportsPKCE()) {
      console.log("PKCE is not supported by the server, using state.");
      /**
       * We cannot be sure the server supports PKCE so we're going to use state too.
       * Use of PKCE is backwards compatible even if the AS doesn't support it which
       * is why we're using it regardless. Like PKCE, random state must be generated
       * for every redirect to the authorization_endpoint.
       */
      state = client.randomState();
      parameters.state = state;
    } else {
      console.log("PKCE is supported by the server, no need for state.");
    }

    let redirectTo: URL = client.buildAuthorizationUrl(config, parameters);

    session.set("code_verifier", code_verifier);
    session.set("state", state);
    session.set("prueba", "prueba");

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
  let user = session.get("user");

  // If the user is already authenticated redirect to the home page
  if (user) return redirect("/");

  // Otherwise return null to render the login page
  return data(null);
}

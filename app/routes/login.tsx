// app/routes/login.tsx or equivalent route file
import { redirect } from "react-router";
import { data } from "@remix-run/node";
import * as client from "openid-client";
import { sessionStorage } from "~/services/auth.server";
import { oidcInstance } from "../services/oidc.server";

import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/theme-toggle";

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
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Stratus</h1>
          <p className="mt-2 text-muted-foreground">Yet Another Google Drive</p>
        </div>

        {actionData?.error ? (
          <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded">
            {actionData.error}
          </div>
        ) : null}

        <form method="post" className="space-y-4">
          <Button type="submit" className="w-full">
            Sign In with Dex
          </Button>
        </form>
      </div>
    </div>
  );
}

// Second, we need to export an action function, here we will use the
// `authenticator.authenticate` method
export async function action({ request }: LoginActionArgs) {
  console.log("Login action called");
  let session = await sessionStorage.getSession(request.headers.get("cookie"));

  try {
    const oidcClient = await oidcInstance()

    const { url, codeVerifier } = await oidcClient.buildAuthorizationUrl();

    session.set("code_verifier", codeVerifier);

    return redirect(url, {
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


export async function loader({ request }: LoginLoaderArgs) {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let accessToken = session.get("access_token");
  if (accessToken) return redirect("/");
  return data(null);
}

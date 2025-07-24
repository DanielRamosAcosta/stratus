// app/routes/login.tsx or equivalent route file
import { redirect } from "react-router";
import { data } from "@remix-run/node";
import { sessionStorage } from "~/services/auth.server";
import { oidcInstance } from "../services/oidc.server";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

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
    <div className="min-h-screen flex">
      {/* Left side - Gray background with quote */}
      <div className="flex-1 bg-muted/30 flex flex-col justify-end p-8">
        <div className="max-w-md">
          <blockquote className="text-sm text-muted-foreground leading-relaxed">
            "On behalf of the future, I ask you of the past to leave us alone. You are not welcome among us. You have no sovereignty where we gather."
          </blockquote>
          <footer className="mt-4 text-xs text-muted-foreground">
            <cite>John Perry Barlow, co-founder of the nonprofit Electronic Frontier Foundation</cite>
          </footer>
        </div>
      </div>

      {/* Right side - Normal background with login card */}
      <div className="flex-1 bg-background flex items-center justify-center relative">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Log or Sign in</CardTitle>
            <CardDescription>
              Sign in with Dex
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {actionData?.error ? (
              <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded mb-4">
                {actionData.error}
              </div>
            ) : null}

            <form method="post">
              <Button type="submit" className="w-full">
                Sign in with Dex
              </Button>
            </form>
          </CardContent>
        </Card>
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

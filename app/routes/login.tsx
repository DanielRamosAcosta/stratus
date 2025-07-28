import {redirect} from "react-router";
import {ActionFunctionArgs, data, LoaderFunctionArgs} from "@remix-run/node";
import {sessionStorage} from "~/services/auth.server";
import {Button} from "~/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card";
import {config} from "~/core/shared/infrastructure/config";
import {Form, useLoaderData} from "@remix-run/react";
import {OIDCClient} from "~/core/shared/infrastructure/auth/OIDCClient";


export default function Component() {
  const { oauthButtonText, error } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen flex">
      {/* Left side - Gray background with quote */}
      <div className="flex-1 bg-muted/30 flex flex-col justify-end p-8">
        <div className="max-w-md">
          <blockquote className="text-sm text-muted-foreground leading-relaxed">
            {'"On behalf of the future, I ask you of the past to leave us alone. You are not welcome among us. You have no sovereignty where we gather."'}
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
          </CardHeader>
          
          <CardContent>
            {error ? (
              <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded mb-4">
                {error}
              </div>
            ) : null}

            <Form method="post">
              <Button type="submit" className="w-full">
                {oauthButtonText}
              </Button>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await sessionStorage.getSession(request.headers.get("cookie"));

  const oidc = await OIDCClient.getInstance();

  const {url, codeVerifier} = await oidc.buildAuthorizationUrl(request.url);

  session.set("code_verifier", codeVerifier);

  return redirect(url, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(request.headers.get("cookie"));
  const accessToken = session.get("access_token");
  if (accessToken) throw redirect("/");
  return data({ oauthButtonText: config.OAUTH_BUTTON_TEXT, error: session.get("error") });
}

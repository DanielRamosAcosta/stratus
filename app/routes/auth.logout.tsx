import { LoaderFunctionArgs, ActionFunctionArgs, redirect } from "@remix-run/node";
import { sessionStorage } from "~/core/shared/infrastructure/auth/SessionStorage";

export async function action({ request }: ActionFunctionArgs) {
  const session = await sessionStorage.getSession(request.headers.get("cookie"));

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}


export async function loader(params: LoaderFunctionArgs) {
  return action(params);
}

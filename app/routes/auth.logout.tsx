import { LoaderFunctionArgs, ActionFunctionArgs, redirect } from "@remix-run/node";
import { sessionStorage } from "~/services/auth.server";


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

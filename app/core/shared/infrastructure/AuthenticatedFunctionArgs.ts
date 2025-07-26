import { ActionFunctionArgs, data, redirect } from "@remix-run/node";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../../users/domain/user";
import { sessionStorage } from "~/services/auth.server";

export type AuthenticatedActionFunctionArgs = ActionFunctionArgs & {
  auth: JwtPayload;
};


export async function protect({
  request,
  ...rest
}: ActionFunctionArgs): Promise<AuthenticatedActionFunctionArgs> {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );

  const accessToken = session.get("access_token");

  if (!accessToken) throw redirect("/login");

  const content = jwt.decode(accessToken) as JwtPayload;

  return {
    ...rest,
    request,
    auth: content,
  };
}

export function multiplex<T extends ActionFunctionArgs>({
  DELETE,
}: {
  DELETE: (args: T) => Promise<void>;
}) {
  return async (args: T) => {
    switch (args.request.method) {
      case "DELETE":
        await DELETE(args);
        return data({ ok: true });
      default:
        throw new Response("Method not allowed", { status: 405 });
    }
  };
}

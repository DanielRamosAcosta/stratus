import z from "zod";
import { ActionFunctionArgs, data, redirect } from "@remix-run/node";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../../users/domain/User";
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

  console.log("accessToken", accessToken);

  return {
    ...rest,
    request,
    auth: content,
  };
}

export function validateFormData<T extends z.ZodSchema>(schema: T) {
  return async <TArgs extends ActionFunctionArgs>({
    request,
    ...rest
  }: TArgs): Promise<TArgs & { data: z.infer<T> }> => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const parsed = schema.safeParse(data);

    if (!parsed.success) {
      throw new Response(JSON.stringify(parsed.error), {
        status: 400,
        statusText: "Bad Request",
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return {
      ...rest,
      request,
      data: parsed.data,
    } as TArgs & { data: z.infer<T> };
  };
}

export type MutationResponse = { ok: boolean };

export function multiplex<
  MethodArgs extends ActionFunctionArgs = ActionFunctionArgs
>({
  DELETE,
  POST,
  PUT,
  PATCH,
}: {
  DELETE?: (args: MethodArgs) => Promise<void>;
  POST?: (args: MethodArgs) => Promise<void>;
  PUT?: (args: MethodArgs) => Promise<void>;
  PATCH?: (args: MethodArgs) => Promise<void>;
}) {
  return async (args: MethodArgs) => {
    switch (args.request.method) {
      case "POST":
        if (!POST) {
          throw new Response("Method not allowed", { status: 405 });
        }

        await POST(args);
        return data({ ok: true });
      case "PUT":
        if (!PUT) {
          throw new Response("Method not allowed", { status: 405 });
        }

        await PUT(args);
        return data({ ok: true });
      case "PATCH":
        if (!PATCH) {
          throw new Response("Method not allowed", { status: 405 });
        }

        await PATCH(args);
        return data({ ok: true });
      case "DELETE":
        if (!DELETE) {
          throw new Response("Method not allowed", { status: 405 });
        }

        await DELETE(args);
        return data({ ok: true });
      default:
        throw new Response("Method not allowed", { status: 405 });
    }
  };
}

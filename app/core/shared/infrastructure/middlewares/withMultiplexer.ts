import { ActionFunctionArgs, data } from "@remix-run/node";

export type MutationResponse = { ok: boolean };

export function withMultiplexer<
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

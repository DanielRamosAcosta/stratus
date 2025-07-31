import { Params } from "@remix-run/react";
import z from "zod";

export function withValidParams<T extends z.ZodSchema>(schema: T) {
  return async <TArgs extends { params: Params<string> }>({
    params,
    ...rest
  }: TArgs): Promise<TArgs & { params: z.infer<T> }> => {
    const parsed = schema.safeParse(params);

    if (!parsed.success) {
      throw new Response(JSON.stringify(parsed.error), {
        status: 400,
        statusText: "Bad Request",
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    console.log("Parsed params:", parsed.data);

    return {
      ...rest,
      params: parsed.data,
    } as TArgs & { params: z.infer<T> };
  };
}

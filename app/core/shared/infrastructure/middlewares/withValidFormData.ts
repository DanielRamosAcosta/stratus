import z from "zod";

export function withValidFormData<T extends z.ZodSchema>(schema: T) {
  return async <TArgs extends { request: Request }>({
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

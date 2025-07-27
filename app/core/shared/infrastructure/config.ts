import { z } from "zod";

const ConfigSchema = z.object({
  OAUTH_BUTTON_TEXT: z.string().default("Sign in with OAuth"),
  OAUTH_SCOPE: z.string().default("openid email profile groups"),
  OAUTH_ISSUER_URL: z.string(),
  OAUTH_CLIENT_ID: z.string(),
  OAUTH_CLIENT_SECRET: z.string(),
});

export const config = ConfigSchema.parse(process.env);

import { z } from "zod";

const ConfigSchema = z.object({
  OAUTH_BUTTON_TEXT: z.string().default("Sign in with OAuth"),
  OAUTH_SCOPE: z.string().default("openid email profile groups"),
  OAUTH_ISSUER_URL: z.string(),
  OAUTH_CLIENT_ID: z.string(),
  OAUTH_CLIENT_SECRET: z.string(),
  OAUTH_CERTIFICATE_PATH: z.string().optional(),
  DB_HOSTNAME: z.string(),
  DB_PORT: z.string().default("5432").transform(Number),
  DB_USERNAME: z.string().default("stratus"),
  DB_PASSWORD: z.string(),
  DB_DATABASE_NAME: z.string().default("stratus"),
});

export const config = ConfigSchema.parse(process.env);

// app/services/auth.server.ts
import { createCookieSessionStorage } from "@remix-run/node";
import { config } from "../config";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: [config.AUTH_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

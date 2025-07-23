// app/services/auth.server.ts
import { createCookieSessionStorage } from "@remix-run/node";

// Create a session storage
// Docs: https://remix.run/docs/en/main/utils/sessions
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: ["s3cr3t"], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production",
  },
});

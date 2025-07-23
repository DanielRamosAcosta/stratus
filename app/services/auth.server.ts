// app/services/auth.server.ts
import { setTimeout } from "node:timers/promises";
import crypto from "node:crypto";
import { createCookieSessionStorage } from "@remix-run/node";

// Define your user type
type User = {
  id: string;
  email: string;
  name: string;
  // ... other user properties
};

// Create a session storage
// Docs: https://remix.run/docs/en/main/utils/sessions
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: ["s3cr3t"], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production",
  },
});

// Create an instance of the authenticator, pass a generic with what
// strategies will return

// Your authentication logic (replace with your actual DB/API calls)
export async function login(email: string, password: string): Promise<User> {
  // Simulate a database lookup
  await setTimeout(1000); // Simulate network delay

  // Replace this with your actual user lookup logic
  return {
    id: crypto.createHash("sha256").update(email).digest("hex"), // Simulate user ID
    email,
    name: "John Doe", // Simulate user name
  };
}


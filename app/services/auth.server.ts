// app/services/auth.server.ts
import {setTimeout}  from "node:timers/promises";
import crypto from "node:crypto";
import { Authenticator } from "remix-auth";
import { createCookieSessionStorage } from "@remix-run/node";
import { FormStrategy } from "remix-auth-form";

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
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: ["s3cr3t"], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production",
  },
});

// Create an instance of the authenticator, pass a generic with what
// strategies will return
export const authenticator = new Authenticator<User>();

// Your authentication logic (replace with your actual DB/API calls)
async function login(email: string, password: string): Promise<User> {
    // Simulate a database lookup
    await setTimeout(1000); // Simulate network delay
    
    // Replace this with your actual user lookup logic
    return {
        id: crypto.createHash('sha256').update(email).digest('hex'), // Simulate user ID
        email,
        name: "John Doe", // Simulate user name
    };
}

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // the type of this user must match the type you pass to the
    // Authenticator the strategy will automatically inherit the type if
    // you instantiate directly inside the `use` method
    return await login(email, password);
  }),
  // each strategy has a name and can be changed to use the same strategy
  // multiple times, especially useful for the OAuth2 strategy.
  "user-pass"
);

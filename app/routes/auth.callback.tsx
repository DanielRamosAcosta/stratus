import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import * as client from "openid-client";
import { login, sessionStorage } from "~/services/auth.server";

type LoaderData = {
  headers: Record<string, string>;
  url: string;
  searchParams: Record<string, string>;
  cookies: string | null;
};

type CallbackLoaderArgs = {
  request: Request;
};

export default function AuthCallback() {
  const data = useLoaderData<LoaderData>();

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>🎉 Hello World - Auth Callback Debug</h1>

      <h2>📡 Request Information</h2>
      <div
        style={{ background: "#f5f5f5", padding: "10px", marginBottom: "20px" }}
      >
        <p>
          <strong>URL:</strong> {data.url}
        </p>
      </div>

      <h2>🔍 Search Parameters</h2>
      <div
        style={{ background: "#f0f8ff", padding: "10px", marginBottom: "20px" }}
      >
        <pre>{JSON.stringify(data.searchParams, null, 2)}</pre>
      </div>

      <h2>📋 Headers</h2>
      <div
        style={{ background: "#fff0f5", padding: "10px", marginBottom: "20px" }}
      >
        <pre>{JSON.stringify(data.headers, null, 2)}</pre>
      </div>

      <h2>🍪 Cookies</h2>
      <div
        style={{ background: "#f0fff0", padding: "10px", marginBottom: "20px" }}
      >
        <pre>{data.cookies || "No cookies found"}</pre>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          border: "2px solid #4CAF50",
          borderRadius: "5px",
        }}
      >
        <p>✅ Callback endpoint is working!</p>
        <p>
          This page shows all the data that Dex sent back to your application.
        </p>
      </div>
    </div>
  );
}

export async function loader({ request }: CallbackLoaderArgs) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  // Get the URL and search parameters
  const url = new URL(request.url);
  const searchParams: Record<string, string> = {};

  // Convert URLSearchParams to a plain object
  url.searchParams.forEach((value, key) => {
    searchParams[key] = value;
  });

  // Get all headers
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Get cookies specifically
  const cookies = request.headers.get("cookie");

  console.log("🔍 AUTH CALLBACK DEBUG:");
  console.log("URL:", request.url);
  console.log("Search Params:", searchParams);
  console.log("Headers:", headers);
  console.log("Cookies:", cookies);

  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let config: client.Configuration = await client.discovery(
    new URL("https://localhost:5556/dex/.well-known/openid-configuration"),
    "yagd",
    "yagd-secret"
  );

  const code = searchParams.code?.toString() || "";
  const state = searchParams.state?.toString() || "";

  const codeVerifier = session.get("code_verifier") || "";

  console.log("Code Verifier:", codeVerifier);
  
  let tokens = await client.authorizationCodeGrant(config, new URL(request.url), {
    pkceCodeVerifier: codeVerifier,
  });

  console.log("Token Endpoint Response", tokens);

  // TODO: store user session using

  return json({
    headers,
    url: request.url,
    searchParams,
    cookies,
  });
}

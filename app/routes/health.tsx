import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  // Basic health check - you can add more sophisticated checks here
  // like database connectivity, external service availability, etc.
  
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "unknown",
  };

  return json(health, {
    status: 200,
    headers: {
      "Cache-Control": "no-cache",
    },
  });
};

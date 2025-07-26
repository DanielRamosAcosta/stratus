import { data, json, redirect } from "@remix-run/node";
import {
  createRescanCommand,
  handleRescan,
} from "../core/rescans/application/RescanHandler";

export async function action() {
  console.log("Rescanning!!");

  await handleRescan(
    createRescanCommand({
      id: crypto.randomUUID(), // Generate a random UUID for the command ID
      ownerId: "CiQ5OGIwODBiNS0yNGU0LTRiMGYtOTc5Yy00M2E5YzQyZTNjMTcSBWxvY2Fs", // Replace with actual owner ID logic if needed
    })
  );

  console.log("Launched rescan command successfully. Waiting for it to finish...");

  return data({ ok: true });
}

// Redirect GET requests to the administration page
export async function loader() {
  throw new Response("Method not allowed", { status: 405 });
}

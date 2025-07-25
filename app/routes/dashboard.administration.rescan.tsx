import { json, redirect } from "@remix-run/node";

export async function action() {
    console.log("Rescanning!!")
  return redirect("/dashboard/administration");
}

// Redirect GET requests to the administration page
export async function loader() {
  throw new Response("Method not allowed", { status: 405 });
}

import { redirect } from "@remix-run/node";

export async function loader() {
  // Redirect to root folder when accessing /dashboard directly
  throw redirect("/dashboard/folders/343cbdbd-2160-4e50-8e05-5ea20dfe0e24");
}

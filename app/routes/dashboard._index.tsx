import { redirect } from "@remix-run/node";

export async function loader() {
  // Redirect to root folder when accessing /dashboard directly
  throw redirect("/dashboard/folders/root");
}

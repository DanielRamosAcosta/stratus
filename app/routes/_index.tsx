import { redirect } from "@remix-run/node";
import { sessionStorage } from "../services/auth.server";

export async function loader({ request }: { request: Request }) {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let accessToken = session.get("access_token");
  if (!accessToken) throw redirect("/login");
  
  // Redirect to dashboard with root folder
  throw redirect("/dashboard/folders/343cbdbd-2160-4e50-8e05-5ea20dfe0e24");
}

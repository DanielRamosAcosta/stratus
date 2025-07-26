import { ActionFunctionArgs, data, redirect } from "@remix-run/node";
import { sessionStorage } from "~/services/auth.server";
import { createDirectory } from "../core/directories/application/handlers/CreateDirectoryHandler";
import {
  DirectoryId,
  randomDirectoryId,
} from "../core/directories/domain/DirectoryId";

export async function action({ request, params }: ActionFunctionArgs) {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let accessToken = session.get("access_token");
  if (!accessToken) throw redirect("/login");

  const formData = await request.formData();

  await createDirectory({
    id: randomDirectoryId(),
    name: formData.get("name")?.toString() ?? "New Folder",
    parentId:
      (formData.get("parentId")?.toString() as DirectoryId) ??
      randomDirectoryId(), // Default to a random parent ID if not provided,
  });

  return data({ ok: true });
}

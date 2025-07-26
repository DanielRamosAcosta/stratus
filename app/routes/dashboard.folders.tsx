import { ActionFunctionArgs, data, redirect } from "@remix-run/node";
import { sessionStorage } from "~/services/auth.server";
import {
  createDirectoryCommand,
  handleCreateDirectory,
} from "../core/directories/application/handlers/CreateDirectoryHandler";
import { randomCommandId } from "../core/shared/domain/CommandBus";
import {
  DirectoryId,
  randomDirectoryId,
} from "../core/directories/domain/DirectoryId";
import { setTimeout } from "timers/promises";

export async function action({ request, params }: ActionFunctionArgs) {
  console.log("Received action:", { request, params });
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let accessToken = session.get("access_token");
  if (!accessToken) throw redirect("/login");

  console.log("Create folder!");

  const formData = await request.formData();
  console.log("url", formData);
  await setTimeout(4000); // Simulate a delay for the action

  await handleCreateDirectory(
    createDirectoryCommand({
      id: randomCommandId(),
      directoryId: randomDirectoryId(),
      name: formData.get("name")?.toString() ?? "New Folder",
      parentId:
        (formData.get("parentId")?.toString() as DirectoryId) ??
        randomDirectoryId(), // Default to a random parent ID if not provided,
    })
  );

  const finalUrl = `/dashboard/folders/${formData.get("parentId")}`;

  return data({ ok: true, });
}

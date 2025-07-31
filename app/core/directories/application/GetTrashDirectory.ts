import {directoryRepository} from "../infrastructure";
import {DirectoryId} from "../domain/DirectoryId";
import {UserId} from "~/core/users/domain/UserId";

export async function getTrashDirectoryId({
  userId,
}: {
  userId: UserId;
}): Promise<DirectoryId> {
  const root = await directoryRepository.getTrashOf(userId);

  if (!root) {
    throw new Error("Root directory not found for user");
  }

  return root.id;
}

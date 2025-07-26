import { deleteDirectory } from "../../../db/DirectoryRepository";
import { EntryId } from "../../shared/domain/EntryId";
import { UserId } from "../../users/domain/user";

export const moveToTrash = async ({
  id,
  userId,
}: {
  id: EntryId;
  userId: UserId;
}): Promise<void> => {
  // TODO: validate that the user has permission to delete this entry
  await deleteDirectory(id);
};

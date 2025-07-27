import { EntryId } from "../../shared/domain/EntryId";
import { deleteDirectory } from "../../shared/infrastructure/db/DirectoryRepository";
import { UserId } from "../../users/domain/User";

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

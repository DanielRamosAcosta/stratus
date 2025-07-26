import { deleteDirectory } from "../../../../db/DirectoryRepository";
import { EntryId } from "../../../shared/domain/EntryId";

export const moveToTrash = async ({ id }: { id: EntryId }): Promise<void> => {
  await deleteDirectory(id);
};

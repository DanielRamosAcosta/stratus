import { DirectoryId, randomDirectoryId } from "../domain/DirectoryId";
import {
  createDirectoryDb,
  findDirectoryById,
} from "../../../db/DirectoryRepository";
import { UserId } from "../../users/domain/User";
import { NewDirectory } from "../../../db/types";

export const createDirectory = async ({
  id = randomDirectoryId(),
  name,
  parentId,
  triggeredBy
}: {
  id?: DirectoryId;
  name: string;
  parentId: DirectoryId;
  triggeredBy: UserId;
}): Promise<void> => {
  const parent = await findDirectoryById(parentId);

  if (!parent) {
    throw new Error(`Parent directory with ID ${parentId} not found`);
  }

  const newDirectory: NewDirectory = {
    id,
    name,
    owner_id: parent.owner_id, // Assuming the owner is the same as the parent
    parent_id: parentId,
    root: false, // This is not a root directory
    last_modified_at: new Date(),
  };

  await createDirectoryDb(newDirectory);
};

import {DirectoryId, random} from "../domain/DirectoryId";
import * as Directory from "../domain/Directory";
import {UserId} from "~/core/users/domain/UserId";
import {directoryRepository} from "~/core/directories/infrastructure";

export const createInitialDirectories = async ({
  rootId = random(),
  trashId = random(),
  triggeredBy
}: {
  rootId?: DirectoryId;
  trashId?: DirectoryId;
  triggeredBy: UserId;
}): Promise<void> => {
  const root = Directory.createRoot({ id: rootId, ownerId: triggeredBy })
  const trash = Directory.createTrash({ id: trashId, ownerId: triggeredBy })

  await directoryRepository.save(root)
  await directoryRepository.save(trash)
};

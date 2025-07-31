import {DirectoryId, randomDirectoryId} from "../domain/DirectoryId";
import * as Directory from "../domain/Directory";
import {UserId} from "~/core/users/domain/UserId";
import {directoryRepository} from "~/core/directories/infrastructure";

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
  const directory = Directory.create({id, name, parentId, ownerId: triggeredBy })

  await directoryRepository.save(directory)
};

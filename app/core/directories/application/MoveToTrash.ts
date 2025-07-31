import {EntryId} from "../../shared/domain/EntryId";
import * as DirectoryId from "../../directories/domain/DirectoryId";
import * as Directory from "../../directories/domain/Directory";
import {UserId} from "~/core/users/domain/UserId";
import {directoryRepository} from "~/core/directories/infrastructure";

export const moveToTrash = async ({
  id,
  userId,
}: {
  id: EntryId;
  userId: UserId;
}): Promise<void> => {
  // TODO: validate that the user has permission to delete this entry

  const trash = await directoryRepository.getTrashOf(userId)

  if (!trash) {
    throw new Error("User does not have trash. Is it initialized?")
  }

  const directory = await directoryRepository.findBy(DirectoryId.cast(id));
  if (directory) {
    Directory.moveToTrash(directory, trash)

    await directoryRepository.save(directory)

    return
  }

  throw new Error(`Could not find entry with id ${id}`)
};

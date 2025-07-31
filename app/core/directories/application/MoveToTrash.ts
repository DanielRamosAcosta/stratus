import { aql } from "arangojs";
import { getTrashOf } from "../../entries/infrastructure/EntryRepository";
import { EntryId } from "../../shared/domain/EntryId";
import { db } from "../../shared/infrastructure/db/db";
import { deleteDirectory } from "../../shared/infrastructure/db/DirectoryRepository";
import { UserId } from "../../users/domain/User";

export const moveToTrash = async ({
  id,
  userId,
}: {
  id: EntryId;
  userId: UserId;
}): Promise<void> => {
  console.log("Moving entry to trash:", id, userId);
  const trashId = await getTrashOf(userId)
  console.log("trash", trashId)

  await db.query(aql`
    FOR edge IN structure
      FILTER edge._to == CONCAT("directories/", ${id})
      UPDATE edge WITH { _from: CONCAT("directories/", ${trashId}) } IN structure
  `)

  // TODO: validate that the user has permission to delete this entry
  // await deleteDirectory(id);
};

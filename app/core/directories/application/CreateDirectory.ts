import { DirectoryId, randomDirectoryId } from "../domain/DirectoryId";
import { UserId } from "../../users/domain/User";
import { db } from "../../shared/infrastructure/db/db";
import { aql } from "arangojs";

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
  const otherDirectory = {
    id: id,
    name,
    lastModifiedAt: new Date(),
  }

  console.log("A punto de guardar el directorio:", otherDirectory);

  await db.query(aql`
    INSERT {
      _key: ${otherDirectory.id},
      name: ${otherDirectory.name},
      lastModifiedAt: ${otherDirectory.lastModifiedAt}
    } INTO directories
    INSERT {_from: CONCAT("directories/", ${parentId}), _to: CONCAT("directories/", ${id}), _key: ${crypto.randomUUID()}} INTO structure
  `);
};

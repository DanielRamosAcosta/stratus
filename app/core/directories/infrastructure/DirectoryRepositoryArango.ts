import {Directory} from "../domain/Directory";
import * as UserId from "../../users/domain/UserId";
import {aql} from "arangojs";
import {db} from "~/core/shared/infrastructure/db/db";


export async function getRootFor(
  userId: UserId.UserId
): Promise<Directory | undefined> {
  throw new Error("Unimplemented method getRootFor#getRootFor")
}

export async function save(directory: Directory): Promise<void> {
  await db.query(aql`
    INSERT {
      _key: ${directory.id},
      name: ${directory.name},
      lastModifiedAt: ${directory.lastModifiedAt}
    } INTO directories
    INSERT {_from: CONCAT("directories/", ${directory.parentId}), _to: CONCAT("directories/", ${directory.id}), _key: ${crypto.randomUUID()}} INTO structure
  `);
}

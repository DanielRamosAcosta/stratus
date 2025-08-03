import { db } from "../../shared/infrastructure/db/database";
import { DirectoryTable } from "../../shared/infrastructure/db/types";
import { Directory, isNormalDirectory } from "../domain/Directory";
import * as DirectoryId from "../domain/DirectoryId";
import * as UserId from "../../users/domain/UserId";

function fromDomain(directory: Directory): DirectoryTable {
  return {
    id: directory.id,
    name: directory.name,
    parent_id: isNormalDirectory(directory) ? directory.parentId : undefined,
    owner_id: directory.ownerId,
    last_modified_at: directory.lastModifiedAt,
  };
}

function toDomain(values: DirectoryTable): Directory {
  return {
    id: DirectoryId.cast(values.id),
    name: values.name,
    parentId: values.parent_id ? DirectoryId.cast(values.parent_id) : undefined,
    ownerId: UserId.cast(values.owner_id),
    lastModifiedAt: values.last_modified_at,
  };
}

export async function getRootOf(
  userId: UserId.UserId
): Promise<Directory | undefined> {
  const value = await db
    .selectFrom("directories")
    .where("owner_id", "=", userId)
    .where("parent_id", "is", null)
    .where("name", "like", "%root")
    .selectAll()
    .executeTakeFirst();

  if (!value) return undefined;
  return toDomain(value);
}

export async function getTrashOf(
    userId: UserId.UserId
): Promise<Directory | undefined> {
  const value = await db
  .selectFrom("directories")
  .where("owner_id", "=", userId)
  .where("parent_id", "is", null)
  .where("name", "like", "%trash")
  .selectAll()
  .executeTakeFirst();

  if (!value) return undefined;
  return toDomain(value);
}

export async function save(directory: Directory): Promise<void> {
  console.log("Saving directory:", directory);
  const directoryTable = fromDomain(directory);
  await db
    .insertInto("directories")
    .values(directoryTable)
    .onConflict((oc) => oc.column("id").doUpdateSet(directoryTable))
    .execute();
}

export async function findBy(directoryId: DirectoryId.DirectoryId): Promise<Directory | undefined> {
  const value = await db
  .selectFrom("directories")
  .where("id", "=", directoryId)
  .selectAll()
  .executeTakeFirst();

  if (!value) return undefined;
  return toDomain(value);
}

export async function deleteAll(userId: UserId.UserId): Promise<void> {
  console.log("Deleting all directories for user:", userId);
  await db
    .deleteFrom("directories")
    .where("owner_id", "=", userId)
    .execute();
}

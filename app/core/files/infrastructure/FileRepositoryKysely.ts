import { db } from "../../shared/infrastructure/db/database";
import { FileTable } from "../../shared/infrastructure/db/types";
import { File } from "../domain/File";
import * as FileId from "../domain/FileId";
import * as UserId from "../../users/domain/UserId";
import * as DirectoryId from "../../directories/domain/DirectoryId";

function fromDomain(file: File): FileTable {
  return {
    id: file.id,
    name: file.name,
    owner_id: file.ownerId,
    parent_id: file.parentId,
    mime_type: file.mimeType,
    size: file.size,
    last_modified_at: file.lastModified,
  };
}

function toDomain(values: FileTable): File {
  return {
    id: FileId.cast(values.id),
    name: values.name,
    parentId: DirectoryId.cast(values.parent_id),
    mimeType: values.mime_type,
    ownerId: UserId.cast(values.owner_id),
    size: values.size,
    lastModified: values.last_modified_at,
  };
}

export async function save(file: File): Promise<void> {
  console.log("Saving file:", file);
  const fileTable = fromDomain(file);
  await db
    .insertInto("files")
    .values(fileTable)
    .onConflict((oc) => oc.column("id").doUpdateSet(fileTable))
    .execute();
}

export async function deleteAll(userId: UserId.UserId): Promise<void> {
  console.log("Deleting all files for user:", userId);
  await db
    .deleteFrom("files")
    .where("owner_id", "=", userId)
    .execute();
}

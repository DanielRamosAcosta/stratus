import {sql} from "kysely"
import {QuickSearchEntry, QuickSearchEntryDirectory, QuickSerachEntryFile} from "../domain/CommandEntry";
import * as DirectoryId from "../../directories/domain/DirectoryId";
import * as UserId from "../../users/domain/UserId";
import * as FileId from "../../files/domain/FileId";
import {ListEntry, ListEntryDirectory, ListEntryFile, ListEntryResponse} from "~/core/entries/domain/ListEntry";
import {db} from "~/core/shared/infrastructure/db/database";
import {EntryView} from "~/core/shared/infrastructure/db/types";
import { mapEach } from "../../../utils/mapEach";

function searchEntryToDomain(entry: EntryView): QuickSearchEntry {
  if (entry.type === "directory") {
    const directory: QuickSearchEntryDirectory = {
      id: DirectoryId.cast(entry.id),
      type: "directory",
      name: entry.name,
      parentId: DirectoryId.cast(entry.parent_id)
    }

    return directory
  }

  if (entry.type === "file") {
    const file: QuickSerachEntryFile = {
      id: FileId.cast(entry.id),
      type: "file",
      name: entry.name,
      mimeType: entry.mime_type as string,
      parentId: DirectoryId.cast(entry.parent_id)
    }

    return file
  }

  throw new Error("Unimplemented method listEntryToDomain#listEntryToDomain")

}

export async function quickSearch(query: string): Promise<QuickSearchEntry[]> {
  return await db.selectFrom("entries")
    .selectAll()
    .where("name", "like", `%${query}%`)
    .whereRef("entries.id", "!=", "entries.parent_id")
    .execute()
    .then(mapEach(searchEntryToDomain));
}

function listEntryToDomain(entry: EntryView): ListEntry {
  if (entry.type === "directory") {
    const directory: ListEntryDirectory = {
      id: entry.id,
      type: "directory",
      name: entry.name,
      owner: {
        id: UserId.cast(entry.owner_id),
        name: entry.owner_name,
        picture: entry.owner_picture
      },
      lastModified: new Date()
    }

    return directory
  }

  if (entry.type === "file") {
    const file: ListEntryFile = {
      id: entry.id,
      type: "file",
      name: entry.name,
      size: 0,
      mimeType: entry.mime_type as string,
      owner: {
        id: UserId.cast(entry.owner_id),
        name: entry.owner_name,
        picture: entry.owner_picture
      },
      lastModified: new Date()
    }

    return file
  }

  throw new Error("Unimplemented method listEntryToDomain#listEntryToDomain")
}

export async function listEntriesOf(directoryId: DirectoryId.DirectoryId): Promise<ListEntryResponse> {
  const entriesPromise = db.selectFrom("entries")
    .selectAll()
    .where("parent_id", "=", directoryId)
    .whereRef("entries.id", "!=", "entries.parent_id")
    .execute()
    .then(mapEach(listEntryToDomain));

  const pathPromise = sql<{id: string, name: string, owner_id: string}>`
    WITH RECURSIVE breadcrumb AS (
      SELECT id, name, parent_id, owner_id, 1 AS depth
      FROM directories
      WHERE id = ${directoryId}

      UNION ALL

      SELECT d.id, d.name, d.parent_id, d.owner_id, b.depth + 1
      FROM directories d INNER JOIN breadcrumb b ON d.id = b.parent_id
    )
    SELECT id, name, owner_id
    FROM breadcrumb
    ORDER BY depth DESC;
  `.execute(db).then(result => result.rows);

  const [entries, path] = await Promise.all([
    entriesPromise,
    pathPromise
  ])

  return {
    path,
    entries,
    owner: {
      id: UserId.cast(path[0].owner_id)
    }
  }
}

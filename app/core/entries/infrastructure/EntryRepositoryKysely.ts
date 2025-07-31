import {sql} from "kysely"
import {QuickSearchEntry, QuickSearchEntryDirectory, QuickSerachEntryFile} from "../domain/CommandEntry";
import * as DirectoryId from "../../directories/domain/DirectoryId";
import * as UserId from "../../users/domain/UserId";
import * as FileId from "../../files/domain/FileId";
import {ListEntry, ListEntryDirectory, ListEntryFile, ListEntryResponse} from "~/core/entries/domain/ListEntry";
import {db} from "~/core/shared/infrastructure/db/database";
import {EntryView} from "~/core/shared/infrastructure/db/types";

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
  const entries = await db.selectFrom("entries")
  .selectAll()
  .where("name", "like", `%${query}%`)
  .whereRef("entries.id", "!=", "entries.parent_id")
  .execute()

  const mappedEntries = entries.map(searchEntryToDomain);
  return mappedEntries

}

function listEntryToDomain(entry: EntryView): ListEntry {
  if (entry.type === "directory") {
    const directory: ListEntryDirectory = {
      id: entry.id,
      type: "directory",
      name: entry.name,
      owner: {
        id: UserId.cast("3ea98ed6-4a6e-4db6-9e26-f9d684265c6d"),
        name: "Daniel Ramos",
        picture: "https://2.gravatar.com/avatar/bd9cf3cfa5c4875128bdd435d7f304403c6c883442670a1cd201abf85d3858d1?size=512&d=initials"
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
        id: UserId.cast("CiQ5OGIwODBiNS0yNGU0LTRiMGYtOTc5Yy00M2E5YzQyZTNjMTcSBWxvY2Fs"),
        name: "Daniel Ramos",
        picture: "https://2.gravatar.com/avatar/bd9cf3cfa5c4875128bdd435d7f304403c6c883442670a1cd201abf85d3858d1?size=512&d=initials"
      },
      lastModified: new Date()
    }

    return file
  }

  throw new Error("Unimplemented method listEntryToDomain#listEntryToDomain")
}

export async function listEntriesOf(directoryId: DirectoryId.DirectoryId): Promise<ListEntryResponse> {
  const entries = await db.selectFrom("entries")
    .selectAll()
    .where("parent_id", "=", directoryId)
    .whereRef("entries.id", "!=", "entries.parent_id")
    .execute()

  const {rows} = await sql`
    WITH RECURSIVE breadcrumb AS (
      SELECT id, name, parent_id, 1 AS depth
      FROM directories
      WHERE id = ${directoryId}

      UNION ALL

      SELECT d.id, d.name, d.parent_id, b.depth + 1
      FROM directories d INNER JOIN breadcrumb b ON d.id = b.parent_id
    )
    SELECT id, name
    FROM breadcrumb
    ORDER BY depth DESC;
  `.execute(db);

  console.log("super query, ", rows)

  const mappedEntries = entries.map(listEntryToDomain);
  return {
    path: rows,
    entries: mappedEntries,
    owner: {
      id: UserId.cast("CiQ5OGIwODBiNS0yNGU0LTRiMGYtOTc5Yy00M2E5YzQyZTNjMTcSBWxvY2Fs")
    }
  }
}

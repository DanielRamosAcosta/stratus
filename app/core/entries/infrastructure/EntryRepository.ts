import { sql } from "kysely";
import { db } from "../../../db/database";
import { CommandEntry } from "../domain/CommandEntry";
import * as FileId from "../../files/domain/FileId";
import * as DirectoryId from "../../directories/domain/DirectoryId";

export async function commandSearch(query: string): Promise<CommandEntry[]> {
  const data = await db
    .selectFrom("entries")
    .selectAll()
    .orderBy(sql`levenshtein(name, ${query})`)
    .limit(10)
    .execute();

  const foo = data.map((entry): CommandEntry => {
    if (entry.type === "directory") {
      return {
        id: DirectoryId.cast(entry.id),
        name: entry.name,
        type: "directory",
        parentId: DirectoryId.cast(entry.parent_id),
      };
    }

    if (entry.type === "file") {
      return {
        id: FileId.cast(entry.id),
        name: entry.name,
        type: "file",
        // @ts-ignore
        mimeType: entry.mime_type,
        parentId: DirectoryId.cast(entry.parent_id),
      };
    }

    throw new Error(`Unknown entry type: ${entry.type}`);
  });

  return foo;
}

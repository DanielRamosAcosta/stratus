import { sql } from "kysely";
import { CommandEntry } from "../domain/CommandEntry";
import * as FileId from "../../files/domain/FileId";
import * as DirectoryId from "../../directories/domain/DirectoryId";
import { db } from "../../shared/infrastructure/db/database";

export async function commandSearch(query: string): Promise<CommandEntry[]> {
  console.log("Searching for entries with query:", query);  

  const data = await db
    .selectFrom("entries")
    .selectAll()
    .orderBy(sql`levenshtein(LOWER(name), LOWER(${query}))`)
    .limit(5)
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

  const names = foo.map((entry) => entry.name);
  console.log("Search results:", names);

  return foo;
}

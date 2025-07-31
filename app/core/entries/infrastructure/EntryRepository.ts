import { sql } from "kysely";
import { QuickSearchEntry } from "../domain/CommandEntry";
import * as FileId from "../../files/domain/FileId";
import * as DirectoryId from "../../directories/domain/DirectoryId";
import { db as kdb } from "../../shared/infrastructure/db/database";
import * as UserId from "../../users/domain/User";
import { db } from "../../shared/infrastructure/db/db";
import { aql } from "arangojs";
import { ListEntry, DirectoryPath, PathSegment, ListEntryDirectory, ListEntryFile } from "../domain/ListEntry";

export async function quickSearch(
  query: string
): Promise<QuickSearchEntry[]> {
  const results = await db.query(aql`
    LET needle = ${query}

    FOR v, e IN 1..9999 OUTBOUND "directories/12618" structure
      LET dist = LEVENSHTEIN_DISTANCE(LOWER(v.name), LOWER(needle))
      SORT dist ASC
      LIMIT 5
      RETURN {
        id: v._key,
        name: v.name,
        type: IS_SAME_COLLECTION("directories", v) ? "directory" : "file",
        mimeType: IS_SAME_COLLECTION("directories", v) ? null : v.mimeType,
        parentId: SUBSTITUTE(e._from, "directories/", "")
      }
  `);

  return await Array.fromAsync(results)
}

export async function listEntriesOf(directoryId: DirectoryId.DirectoryId) {
  console.log("Listing entries for directory:", directoryId);

  const cursor = await db.query(aql`
    LET directory = DOCUMENT(CONCAT("directories/", ${directoryId}))

    LET descendants = (
      FOR v IN 1..1 OUTBOUND directory structure
        RETURN v
    )

    LET rawPath = (
      FOR v, e, p IN 1..100 INBOUND directory structure
        OPTIONS { bfs: true, uniqueVertices: "path" }
        FILTER IS_SAME_COLLECTION("users", v)
        LIMIT 1
        RETURN p.vertices
    )

    LET pathToUser = REVERSE(LENGTH(rawPath) > 0 ? SLICE(rawPath[0], 0) : [])

    LET owner = pathToUser[0]

    LET pathToRoot = SHIFT(pathToUser)

    RETURN {
      directory,
      descendants,
      pathToRoot,
      owner
    }
  `);

  const data = await cursor.next();

  const path: DirectoryPath = data.pathToRoot.map((segment: any): PathSegment => {
    return ({
      id: DirectoryId.cast(segment._key),
      name: segment.name,
    });
  });

  const entries: ListEntry[] = data.descendants.map((entry: any): ListEntry => {
    if (entry._id.startsWith("directories/")) {
      const dir: ListEntryDirectory = {
        id: DirectoryId.cast(entry._key),
        type: "directory",
        name: entry.name,
        owner: {
          id: UserId.cast(data.owner._key),
          name: data.owner.name,
          picture: data.owner.picture,
        },
        lastModified: new Date(), // Placeholder, adjust as needed
      }

      return dir;
    }
    if (entry._id.startsWith("files/")) {
      const file: ListEntryFile = {
        id: FileId.cast(entry._key),
        type: "file",
        name: entry.name,
        size: 0, // Placeholder, adjust as needed
        mimeType: "application/octet-stream", // Placeholder, adjust as needed
        owner: {
          id: UserId.cast(data.owner._key),
          name: data.owner.name,
          picture: data.owner.picture,
        },
        lastModified: new Date(), // Placeholder, adjust as needed
      };
      
      return file;
    }

    throw new Error(`Unknown entry type: ${entry.type}`);
  })

  return {
    path,
    entries,
    owner: {
      id: UserId.cast(data.owner._key),
    }
  }
}


export async function getRootOf(userId: UserId.UserId): Promise<DirectoryId.DirectoryId> {
  const cursor = await db.query(aql`
    LET rootDirId = FIRST(
      FOR edge IN structure
        FILTER edge._from == CONCAT("users/", ${userId})
           AND edge.type == "root"
           AND STARTS_WITH(edge._to, "directories/")
        RETURN edge._to
    )

    RETURN DOCUMENT(rootDirId)._key
  `);

  const data = await cursor.next();

  return DirectoryId.cast(data);
}

export async function getTrashOf(userId: UserId.UserId): Promise<DirectoryId.DirectoryId> {
  const cursor = await db.query(aql`
    LET rootDirId = FIRST(
      FOR edge IN structure
        FILTER edge._from == CONCAT("users/", ${userId})
           AND edge.type == "trash"
           AND STARTS_WITH(edge._to, "directories/")
        RETURN edge._to
    )

    RETURN DOCUMENT(rootDirId)._key
  `);

  const data = await cursor.next();

  return DirectoryId.cast(data);
}

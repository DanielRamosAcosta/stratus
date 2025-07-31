import { aql } from "arangojs";
import { db } from "../../shared/infrastructure/db/db";
import { File } from "../domain/File";

export function save(file: File) {
  return db.query(aql`
    INSERT {
      _key: ${file.id},
      size: ${file.size},
      mimeType: ${file.mimeType},
      name: ${file.name},
      lastModified: ${file.lastModified.toISOString()}
    } INTO files
    OPTIONS { overwriteMode: "ignore" }

    INSERT {
      _from: CONCAT("directories/", ${file.parentId}),
      _to: CONCAT("files/", ${file.id}),
    } INTO structure
    OPTIONS { overwriteMode: "ignore" }
  `);
}

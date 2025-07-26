import { DirectoryId } from "../../directories/domain/DirectoryId";
import { FileId } from "../../files/domain/FileId";

export type EntryId = DirectoryId | FileId;

export function cast(id: string): EntryId {
  return id as EntryId;
}

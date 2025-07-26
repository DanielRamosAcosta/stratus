import { Identifier } from "../../shared/domain/Identifier";

export type DirectoryId = Identifier<"DirectoryId", string>;

export function randomDirectoryId(): DirectoryId {
  return crypto.randomUUID() as DirectoryId;
}

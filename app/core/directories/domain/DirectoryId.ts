import type { Identifier } from "../../shared/domain/Identifier";

export type DirectoryId = Identifier<"DirectoryId", string>;

export function random(): DirectoryId {
  return crypto.randomUUID() as DirectoryId;
}

export function cast(id: string): DirectoryId {
  return id as DirectoryId;
}

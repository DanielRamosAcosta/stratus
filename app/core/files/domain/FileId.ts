import { Identifier } from "../../shared/domain/Identifier";

export type FileId = Identifier<"FileId", string>;

export function random(): FileId {
  return crypto.randomUUID() as FileId;
}

export function cast(id: string): FileId {
  return id as FileId;
}

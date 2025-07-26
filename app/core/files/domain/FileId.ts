import { Identifier } from "../../shared/domain/Identifier";

export type FileId = Identifier<"FileId", string>;

export function randomFileId(): FileId {
  return crypto.randomUUID() as FileId;
}

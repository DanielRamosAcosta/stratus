import { DirectoryId } from "../../directories/domain/DirectoryId";
import { UserId } from "../../users/domain/UserId";
import { FileId } from "./FileId";

export type File = {
  id: FileId;
  size: number;
  mimeType: string;
  name: string;
  lastModified: Date;
  ownerId: UserId;
  parentId: DirectoryId
};


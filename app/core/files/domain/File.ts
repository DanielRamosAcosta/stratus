import { DirectoryId } from "../../directories/domain/DirectoryId";
import { FileId } from "./FileId";

export type File = {
  id: FileId;
  size: number;
  mimeType: string;
  name: string;
  lastModified: Date;
  parentId: DirectoryId
};


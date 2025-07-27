import { UserId } from "../../users/domain/User";
import * as DirectoryId from "./DirectoryId";

export type Directory = {
  id: DirectoryId.DirectoryId;
  name: string;
  parentId: DirectoryId.DirectoryId;
  ownerId: UserId;
  lastModifiedAt: Date;
};

export function isRoot(directory: Directory) {
  return directory.parentId === directory.id;
}

export function createRoot(
  ownerId: UserId
): Directory {
  const id = DirectoryId.randomDirectoryId();

  return {
    id,
    name: ownerId,
    parentId: id,
    ownerId,
    lastModifiedAt: new Date(),
  };
}

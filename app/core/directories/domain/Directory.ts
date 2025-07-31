import {UserId} from "~/core/users/domain/UserId";
import * as DirectoryId from "./DirectoryId";

export type Directory = {
  id: DirectoryId.DirectoryId;
  name: string;
  parentId: DirectoryId.DirectoryId;
  ownerId: UserId;
  lastModifiedAt: Date;
};

export function create({
                         id,
                         name,
                         parentId,
                         ownerId
                       }: {
  id: DirectoryId.DirectoryId;
  name: string;
  parentId: DirectoryId.DirectoryId;
  ownerId: UserId;
}): Directory {
  return {
    id,
    name,
    parentId,
    ownerId,
    lastModifiedAt: new Date()
  }
}

export function createRoot({
                             id = DirectoryId.randomDirectoryId(),
                             ownerId
                           }: {
  id?: DirectoryId.DirectoryId
  ownerId: UserId
}): Directory {
  return {
    id,
    name: `${ownerId}-root`,
    parentId: id,
    ownerId,
    lastModifiedAt: new Date(),
  };
}

export function createTrash({
                              id = DirectoryId.randomDirectoryId(),
                              ownerId
                            }: {
  id?: DirectoryId.DirectoryId
  ownerId: UserId
}): Directory {
  return {
    id,
    name: `${ownerId}-trash`,
    parentId: id,
    ownerId: ownerId,
    lastModifiedAt: new Date(),
  };
}

export function moveToTrash(directory: Directory, trash: Directory) {
  directory.parentId = trash.id
}

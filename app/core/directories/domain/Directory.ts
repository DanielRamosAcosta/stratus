import { UserId } from "~/core/users/domain/UserId";
import * as DirectoryId from "./DirectoryId";

export type Directory = NormalDirectory | RootDirectory;

export type NormalDirectory = {
  id: DirectoryId.DirectoryId;
  name: string;
  parentId: DirectoryId.DirectoryId;
  ownerId: UserId;
  lastModifiedAt: Date;
};

export type RootDirectory = {
  id: DirectoryId.DirectoryId;
  name: string;
  ownerId: UserId;
  lastModifiedAt: Date;
};

export function isRootDirectory(directory: Directory): directory is RootDirectory {
  return ("parentId" in directory) === false;
}

export function isNormalDirectory(directory: Directory): directory is NormalDirectory {
  return ("parentId" in directory) === true;
}

export function create({
  id,
  name,
  parentId,
  ownerId,
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
    lastModifiedAt: new Date(),
  };
}

export function createRoot({
  id = DirectoryId.random(),
  ownerId,
}: {
  id?: DirectoryId.DirectoryId;
  ownerId: UserId;
}): RootDirectory {
  return {
    id,
    name: `${ownerId}-root`,
    ownerId,
    lastModifiedAt: new Date(),
  };
}

export function createTrash({
  id = DirectoryId.random(),
  ownerId,
}: {
  id?: DirectoryId.DirectoryId;
  ownerId: UserId;
}): RootDirectory {
  return {
    id,
    name: `${ownerId}-trash`,
    ownerId: ownerId,
    lastModifiedAt: new Date(),
  };
}

export function moveToTrash(directory: Directory, trash: Directory) {
  if (isNormalDirectory(directory)) {
    directory.parentId = trash.id;
  }
}

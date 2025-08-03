import { basename } from "node:path";
import * as Directory from "../../directories/domain/Directory";
import * as DirectoryId from "../../directories/domain/DirectoryId";
import * as UserId from "../../users/domain/UserId";

export type ObjectDirectory = {
  path: string;
  type: "directory";
};

export function getName(self: ObjectDirectory): string {
  return basename(self.path);
}

export function toDirectory(self: ObjectDirectory, ownerId: UserId.UserId, parentId: DirectoryId.DirectoryId): Directory.Directory {
  return {
    id: DirectoryId.random(),
    name: getName(self),
    parentId,
    ownerId,
    lastModifiedAt: new Date(),
  };
}

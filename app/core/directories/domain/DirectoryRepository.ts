import {UserId} from "~/core/users/domain/UserId"
import {Directory} from "./Directory"
import {DirectoryId} from "~/core/directories/domain/DirectoryId";

export interface DirectoryRepository {
  findBy(directoryId: DirectoryId): Promise<Directory | undefined>
  getRootOf(userId: UserId): Promise<Directory | undefined>;
  getTrashOf(userId: UserId): Promise<Directory | undefined>;
  save(directory: Directory): Promise<void>
}

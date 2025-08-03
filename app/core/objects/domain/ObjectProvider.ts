import { UserId } from "../../users/domain/UserId";
import { ObjectDirectory } from "./ObjectDirectory";
import { ObjectEntry } from "./ObjectEntry";
import { ObjectFile, ObjectFileMetadata } from "./ObjectFile";

export interface ObjectProvider {
  readDirectory(userId: UserId, path: string): Promise<Array<ObjectEntry>>;
  readMetadata(userId: UserId, path: string): Promise<ObjectFileMetadata>;
}

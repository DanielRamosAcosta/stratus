import { UserId } from "../../users/domain/UserId";

export interface FileRepository {
  save(file: File): Promise<void>;
  deleteAll(userId: UserId): Promise<void>;
}

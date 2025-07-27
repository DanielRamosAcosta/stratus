import * as DirectoryRepository from "../../directories/infrastructure/DirectoryRepository";
import { UserId } from "../../users/domain/User";
import { DirectoryId } from "../domain/DirectoryId";

export async function getRootDirectory({
  userId,
}: {
  userId: UserId;
}): Promise<DirectoryId> {
  const root = await DirectoryRepository.getRootFor(userId);

  if (!root) {
    throw new Error("Root directory not found for user");
  }

  return root.id;
}

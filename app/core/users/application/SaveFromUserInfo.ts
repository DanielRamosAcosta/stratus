import { OidcUserInfo } from "../domain/User";
import * as User from "../domain/User";
import * as Directory from "../../directories/domain/Directory";
import * as DirectoryRepository from "../../directories/infrastructure/DirectoryRepository";
import * as UserRepository from "../infrastructure/UserRepositoryKysely";

export async function saveFromUserInfo({
  userInfo,
}: {
  userInfo: OidcUserInfo;
}): Promise<void> {
  const user = User.fromOidc(userInfo);
  await UserRepository.save(user);
  const root = await DirectoryRepository.getRootFor(user.id) ?? Directory.createRoot(user.id)
  await DirectoryRepository.save(root)
}

import { OidcUserInfo } from "../domain/User";
import * as User from "../domain/User";
import * as Directory from "../../directories/domain/Directory";
import * as DirectoryRepository from "../../directories/infrastructure/DirectoryRepositoryKysely";
import {userRepository} from "../infrastructure";
import {createInitialDirectories} from "~/core/directories/application/CreateInitialDirectories";

export async function saveFromUserInfo({
  userInfo,
}: {
  userInfo: OidcUserInfo;
}): Promise<void> {
  const user = User.fromOidc(userInfo);
  await userRepository.save(user);
  await createInitialDirectories({ triggeredBy: user.id })
}

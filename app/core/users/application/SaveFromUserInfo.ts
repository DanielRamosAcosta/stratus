import * as User from "../domain/User";
import {OidcUserInfo} from "../domain/User";
import {userRepository} from "../infrastructure";
import {createInitialDirectories} from "~/core/directories/application/CreateInitialDirectories";

export async function saveFromUserInfo({
  userInfo,
}: {
  userInfo: OidcUserInfo;
}): Promise<void> {
  const user = User.fromOidc(userInfo);
  console.log("Save the user", user);
  await userRepository.save(user);
  console.log("Create initial directories for the user", user.id);
  await createInitialDirectories({ triggeredBy: user.id })
}

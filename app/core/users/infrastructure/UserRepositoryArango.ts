import {db} from "../../shared/infrastructure/db/db";
import {User} from "../domain/User";
import * as UserId from "../domain/UserId";
import {UserTable} from "./UserTable";

function fromDomain(user: User): UserTable {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    given_name: user.givenName ?? null,
    family_name: user.familyName ?? null,
    picture: user.picture ?? null,
    groups: user.groups,
  };
}

const Users = db.collection("users");

export async function save(user: User): Promise<void> {
  const userDto = fromDomain(user);

  const exists = await Users.exists();

  if (!exists) {
    await Users.create();
    console.log("Colección 'users' creada.");
  }


  await Users.save({
    ...userDto,
    _key: user.id,
  }, {
    overwriteMode: "update",
  });
}


import { db } from "../../shared/infrastructure/db/database";
import { User } from "../domain/User";
import * as UserId from "../domain/UserId";
import { UserTable } from "./UserTable";

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

export async function save(user: User): Promise<void> {
  const userTable = fromDomain(user);

  await db
    .insertInto("users")
    .values(userTable)
    .onConflict((oc) => oc.column("id").doUpdateSet(userTable))
    .execute()
}

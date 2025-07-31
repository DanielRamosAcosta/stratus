import {User} from "~/core/users/domain/User";

export interface UserRepository {
  save(user: User): Promise<void>
}

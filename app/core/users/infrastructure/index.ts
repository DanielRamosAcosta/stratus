import {UserRepository} from "~/core/users/domain/UserRepository";
import * as UserRepositoryArango from "./UserRepositoryArango";

export const userRepository: UserRepository = UserRepositoryArango

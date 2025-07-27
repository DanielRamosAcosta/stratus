import { Identifier } from "../../shared/domain/Identifier";

export type UserId = Identifier<"UserId">;

export function cast(id: string): UserId {
  return id as UserId;
}

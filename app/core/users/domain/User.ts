import { Identifier } from "../../shared/domain/Identifier";

export type UserId = Identifier<"UserId">;

export type JwtPayload = {
  iss: string;
  sub: UserId;
  aud: string;
  exp: number;
  iat: number;
  email: string;
  email_verified: boolean;
  name: string;
};

import { Identifier } from "../../shared/domain/Identifier";

export type UserId = Identifier<"UserId">;

export type User = {
  id: UserId;
  email: string;
  name: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  groups: string[];
}

export type OidcUserInfo = {
  sub: UserId;
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

export function fromOidc(userInfo: OidcUserInfo): User {
  return {
    id: userInfo.sub,
    email: userInfo.email,
    name: userInfo.name,
    givenName: userInfo.given_name,
    familyName: userInfo.family_name,
    picture: userInfo.picture,
    groups: [],
  };
}

export function getInitials(user: User): string {
  if (user.givenName && user.familyName) {
    return (user.givenName.charAt(0) + user.familyName.charAt(0)).toUpperCase();
  }
  
  if (user.name.length >= 2) {
    return user.name.substring(0, 2).toUpperCase();
  }
  
  if (user.name.length === 1) {
    return user.name.repeat(2).toUpperCase();
  }
  
  return "??";
}

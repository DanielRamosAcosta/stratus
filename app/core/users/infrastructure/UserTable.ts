export type UserTable = {
  id: string;
  name: string;
  email: string;
  given_name: string | null;
  family_name: string | null;
  picture: string | null;
  groups: string[];
};

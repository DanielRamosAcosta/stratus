import { Insertable, Selectable, Updateable } from "kysely";

type UserTable = {
  id: string;
  name: string;
};

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export type DirectoryTable = {
  id: string;
  name: string;
  owner_id: string;
  parent_id: string;
  root: boolean;
};

export type Directory = Selectable<DirectoryTable>;
export type NewDirectory = Insertable<DirectoryTable>;
export type DirectoryUpdate = Updateable<DirectoryTable>;

export type FileTable = {
  id: string;
  name: string;
  owner_id: string;
  parent_id: string;
};

export type File = Selectable<FileTable>;
export type NewFile = Insertable<FileTable>;
export type FileUpdate = Updateable<FileTable>;

export type RescanTable = {
  id: string;
  owner_id: string;
  started_at: Date;
  finished_at: Date | null;
  total_files: number;
  processed_files: number;
};

export type Rescan = Selectable<RescanTable>;
export type NewRescan = Insertable<RescanTable>;
export type RescanUpdate = Updateable<RescanTable>;

export interface Database {
  directories: DirectoryTable;
  files: FileTable;
  users: UserTable;
  rescans: RescanTable;
}

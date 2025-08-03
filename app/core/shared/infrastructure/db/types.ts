import { Insertable, Selectable, Updateable } from "kysely";
import { UserTable } from "../../../users/infrastructure/UserTable";

export type DirectoryTable = {
  id: string;
  name: string;
  owner_id: string;
  parent_id?: string;
  last_modified_at: Date;
};

export type Directory = Selectable<DirectoryTable>;
export type NewDirectory = Insertable<DirectoryTable>;
export type DirectoryUpdate = Updateable<DirectoryTable>;

export type FileTable = {
  id: string;
  name: string;
  owner_id: string;
  parent_id: string;
  mime_type: string;
  size: number;
  last_modified_at: Date;
};

export type File = Selectable<FileTable>;
export type NewFile = Insertable<FileTable>;
export type FileUpdate = Updateable<FileTable>;

export type RescanRunningTable = {
  id: string;
  owner_id: string;
  imported_directories: number;
  imported_files: number;
  started_at: Date;
};

export type RescanCompletedTable = {
  id: string;
  owner_id: string;
  imported_directories: number;
  imported_files: number;
  started_at: Date;
  finished_at: Date;
};

export type RescanErrorTable = {
  id: string;
  owner_id: string;
  message: string;
  imported_directories: number;
  imported_files: number;
  started_at: Date;
  finished_at: Date;
};

export type EntryView = {
  id: string;
  name: string;
  parent_id: string;
  type: "directory" | "file"
  size?: number
  mime_type?: string
  owner_id: string;
  owner_name: string;
  owner_picture?: string;
}

export interface Database {
  directories: DirectoryTable;
  files: FileTable;
  users: UserTable;
  rescans_running: RescanRunningTable;
  rescans_completed: RescanCompletedTable;
  rescans_error: RescanErrorTable;
  entries: EntryView;
}

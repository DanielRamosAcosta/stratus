import { UserId } from "../../users/domain/UserId";

export type PathSegment = {
  id: string;
  name: string;
};

export type DirectoryPath = PathSegment[];

export type UserListEntry = {
  id: UserId;
  name: string;
  picture?: string;
};

export type ListEntryDirectory = {
  id: string;
  type: "directory";
  name: string;
  owner: UserListEntry;
  lastModified: Date;
};

export type ListEntryFile = {
  id: string;
  type: "file";
  size: number;
  mimeType: string;
  name: string;
  owner: UserListEntry;
  lastModified: Date;
};

export type ListEntrySymlink = {
  id: string;
  type: "symlink";
  name: string;
};

export type ListEntry = ListEntryDirectory | ListEntryFile | ListEntrySymlink;

export type ListEntryResponse = {
  path: DirectoryPath;
  entries: ListEntry[];
  owner: {
    id: UserId;
  };
};

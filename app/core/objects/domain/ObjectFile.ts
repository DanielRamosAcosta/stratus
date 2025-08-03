import { basename } from "node:path";

export type ObjectFile = {
  path: string;
  type: "file";
};

export type ObjectFileMetadata = {
  size: number;
  lastModified: Date;
  mimeType: string;
}


export function getName(params: ObjectFile): string {
  return basename(params.path);
}

import { ObjectDirectory } from "./ObjectDirectory";
import { ObjectFile } from "./ObjectFile";

export type ObjectEntry = ObjectDirectory | ObjectFile;

export function isFile(params: ObjectEntry): params is ObjectFile {
  return params.type === "file";
}

export function isDirectory(params: ObjectEntry): params is ObjectDirectory {
  return params.type === "directory";
}

export function findDirectoryOrThrow(
  entries: ObjectEntry[],
  path: string
): ObjectDirectory {
  const directories = entries.filter(isDirectory);

  const directory = directories.find((d) => d.path === path);

  if (!directory) {
    throw new Error(`Directory not found: ${path}`);
  }

  return directory;
}

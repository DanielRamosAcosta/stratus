import { db } from './database'
import { Directory, NewDirectory } from './types';

export async function createDirectory(newDirectory: NewDirectory) {
  return await db.insertInto('directories')
    .values(newDirectory)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function findChildrenDirectories(id: string) {
  return await db.selectFrom('directories')
    .where('parent_id', '=', id)
    .selectAll()
    .execute()
}

export async function findDirectoryContents(id: string) {
  const directories = await db.selectFrom('directories')
    .where('parent_id', '=', id)
    .where('root', '=', false)
    .selectAll()
    .execute();

  const files = await db.selectFrom('files')
    .where('parent_id', '=', id)
    .selectAll()
    .execute();

  return { directories, files };
}

export async function getDirectoryPath(id: string) {
  const path: Directory[] = [];
  let currentId: string | null = id;

  while (currentId) {
    const directory = await db.selectFrom('directories')
      .where('id', '=', currentId)
      .selectAll()
      .executeTakeFirst();

    if (!directory || directory.root) break;
    path.unshift(directory);
    currentId = directory.parent_id;
  }

  return path;
}
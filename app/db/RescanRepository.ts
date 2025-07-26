import { db } from './database'
import { Directory, NewDirectory, NewRescan } from './types';

export async function createRescan(newRescan: NewRescan) {
  return await db.insertInto('rescans')
    .values(newRescan)
    .execute();
}

export async function findRunningRescan(ownerId: string) {
  return await db.selectFrom('rescans')
    .where('owner_id', '=', ownerId)
    .where('finished_at', 'is', null)
    .selectAll()
    .executeTakeFirst();
}

export async function updateRescanProcessedFiles(id: string, processedFiles: number) {
  return await db.updateTable('rescans')
    .set({ processed_files: processedFiles })
    .where('id', '=', id)
    .execute();
}

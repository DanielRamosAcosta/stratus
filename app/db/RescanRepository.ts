import {
  isCompleted,
  isError,
  isRunning,
  NoRescanStatus,
  Rescan,
  RescanStatusCompleted,
  RescanStatusError,
  RescanStatusRunning,
} from "../core/rescans/domain/rescan";
import { db } from "./database";
import { Directory, NewDirectory } from "./types";

export async function save(rescan: Rescan) {
  if (isRunning(rescan)) {
    return await db
      .insertInto("rescans_running")
      .values({
        id: rescan.id,
        owner_id: rescan.ownerId,
        total_files: rescan.totalFiles,
        processed_files: rescan.processedFiles,
        started_at: rescan.startedAt,
      })
      .onConflict((oc) => oc
        .column("id")
        .doUpdateSet({
          total_files: rescan.totalFiles,
          processed_files: rescan.processedFiles,
        })
      )
      .execute();
  } else if (isCompleted(rescan)) {
    await db
      .insertInto("rescans_completed")
      .values({
        id: rescan.id,
        owner_id: rescan.ownerId,
        total_files: rescan.totalFiles,
        processed_files: rescan.processedFiles,
        started_at: rescan.startedAt,
        finished_at: rescan.finishedAt,
      })
      .onConflict((oc) => oc
        .column("id")
        .doUpdateSet({
          total_files: rescan.totalFiles,
          processed_files: rescan.processedFiles,
          finished_at: rescan.finishedAt,
        })
      )
      .execute();

    await db
      .deleteFrom("rescans_running")
      .where("id", "=", rescan.id)
      .execute();

    return;
  } else if (isError(rescan)) {
    await db
      .insertInto("rescans_error")
      .values({
        id: rescan.id,
        owner_id: rescan.ownerId,
        started_at: rescan.startedAt,
        finished_at: rescan.finishedAt,
        message: rescan.message,
      })
      .onConflict((oc) => oc
        .column("id")
        .doUpdateSet({
          finished_at: rescan.finishedAt,
          message: rescan.message,
        })
      )
      .execute();

    await db
      .deleteFrom("rescans_running")
      .where("id", "=", rescan.id)
      .execute();
    return;
  } else if (rescan === null) {
    return;
  }

  throw new Error("Invalid rescan state", rescan);
}

export async function findLatestRescan(ownerId: string): Promise<Rescan> {
  const runningRescan = await db
    .selectFrom("rescans_running")
    .where("owner_id", "=", ownerId)
    .selectAll()
    .executeTakeFirst();

  const completedRescan = await db
    .selectFrom("rescans_completed")
    .where("owner_id", "=", ownerId)
    .orderBy("started_at", "desc")
    .selectAll()
    .executeTakeFirst();

  const errorRescan = await db
    .selectFrom("rescans_error")
    .where("owner_id", "=", ownerId)
    .orderBy("started_at", "desc")
    .selectAll()
    .executeTakeFirst();

  // Running rescan takes priority
  if (runningRescan) {
    return {
      id: runningRescan.id,
      ownerId: runningRescan.owner_id,
      type: "running",
      totalFiles: runningRescan.total_files,
      processedFiles: runningRescan.processed_files,
      startedAt: runningRescan.started_at,
    };
  }

  // Find the most recent between completed and error
  const candidates: (RescanStatusCompleted | RescanStatusError)[] = [
    completedRescan
      ? {
          id: completedRescan.id,
          ownerId: completedRescan.owner_id,
          type: "completed" as const,
          totalFiles: completedRescan.total_files,
          processedFiles: completedRescan.processed_files,
          startedAt: completedRescan.started_at,
          finishedAt: completedRescan.finished_at,
        }
      : undefined,
    errorRescan
      ? {
          id: errorRescan.id,
          ownerId: errorRescan.owner_id,
          type: "error" as const,
          startedAt: errorRescan.started_at,
          finishedAt: errorRescan.finished_at,
          message: errorRescan.message,
        }
      : undefined,
  ].filter((candidate): candidate is NonNullable<typeof candidate> =>
    Boolean(candidate)
  );

  if (candidates.length === 0) {
    return undefined;
  }

  // Return the most recent one based on startedAt
  return candidates.reduce((latest, current) =>
    current.startedAt > latest.startedAt ? current : latest
  );
}

export async function updateRescanProcessedFiles(
  id: string,
  processedFiles: number
) {
  return await db
    .updateTable("rescans_running")
    .set({ processed_files: processedFiles })
    .where("id", "=", id)
    .execute();
}

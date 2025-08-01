export type NoRescanStatus = undefined;

export type RescanStatusRunning = {
  id: string;
  ownerId: string;
  type: "running";
  totalFiles: number;
  processedFiles: number;
  startedAt: Date;
};

export function isRunning(rescan: Rescan): rescan is RescanStatusRunning {
  return rescan?.type === "running";
}

export type RescanStatusCompleted = {
  id: string;
  ownerId: string;
  type: "completed";
  totalFiles: number;
  processedFiles: number;
  startedAt: Date;
  finishedAt: Date;
};

export function isCompleted(rescan: Rescan): rescan is RescanStatusCompleted {
  return rescan?.type === "completed";
}

export type RescanStatusError = {
  id: string;
  ownerId: string;
  type: "error";
  message: string;
  startedAt: Date;
  finishedAt: Date;
};

export function isError(rescan: Rescan): rescan is RescanStatusError {
  return rescan?.type === "error";
}

export type Rescan =
  | NoRescanStatus
  | RescanStatusRunning
  | RescanStatusCompleted
  | RescanStatusError;

export function launch({
  id = crypto.randomUUID(),
  ownerId,
}: {
  id?: string;
  ownerId: string;
}): RescanStatusRunning {
  return {
    id,
    ownerId,
    type: "running",
    totalFiles: 0,
    processedFiles: 0,
    startedAt: new Date(),
  };
}

export function complete(rescan: RescanStatusRunning): RescanStatusCompleted {
  return {
    ...rescan,
    type: "completed",
    finishedAt: new Date(),
  };
}

export function toError(
  rescan: RescanStatusRunning,
  message: string
): RescanStatusError {
  return {
    ...rescan,
    type: "error",
    message,
    finishedAt: new Date(),
  };
}

export function catchError(rescan: RescanStatusRunning, error: unknown): RescanStatusError {
    return toError(
        rescan,
        error instanceof Error ? error.message : String(error)
    );
}

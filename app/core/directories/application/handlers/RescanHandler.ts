import {
  Command,
  CommandHandler,
  CommandId,
  CommandType,
  randomCommandId,
} from "../../../shared/domain/CommandBus";
import { deleteDirectory } from "../../../../db/DirectoryRepository";
import { EntryId } from "../../../shared/domain/EntryId";
import {
  createRescan,
  updateRescanProcessedFiles,
} from "../../../../db/RescanRepository";
import { setTimeout } from "node:timers/promises";

export type RescanCommand = Command<{
  id: string;
  ownerId: string;
}>;

export function createRescanCommand({
  id,
  ownerId,
}: {
  id: string;
  ownerId: string;
}): RescanCommand {
  return {
    id: randomCommandId(),
    type: CommandType.RESCAN,
    createdAt: new Date(),
    payload: {
      id,
      ownerId,
    },
  };
}

export const handleRescan: CommandHandler<RescanCommand> = async (
  command
): Promise<void> => {
  const totalFiles = 1918;

  await createRescan({
    id: command.payload.id,
    owner_id: command.payload.ownerId,
    started_at: new Date(),
    finished_at: null,
    total_files: totalFiles,
    processed_files: 0,
  });

  Promise.resolve().then(async () => {
    for (let i = 0; i < totalFiles; i++) {
      await setTimeout(10);
      console.log(`Rescanning... ${i + 1}%`);
      await updateRescanProcessedFiles(command.payload.id, i + 1);
    }
  });
};

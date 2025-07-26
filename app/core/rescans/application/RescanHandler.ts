import {
  Command,
  CommandHandler,
  CommandId,
  CommandType,
  randomCommandId,
} from "../../shared/domain/CommandBus";
import { deleteDirectory } from "../../../db/DirectoryRepository";
import { EntryId } from "../../shared/domain/EntryId";
import { save, updateRescanProcessedFiles } from "../../../db/RescanRepository";
import { setTimeout } from "node:timers/promises";
import { catchError, complete, launch } from "../domain/rescan";

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
  const totalFiles = Math.floor(Math.random() * (1000 - 700 + 1)) + 700;

  const rescan = await launch({ ownerId: command.payload.ownerId, totalFiles });

  Promise.resolve()
    .then(async () => {
      for (let i = 0; i < totalFiles; i++) {
        await setTimeout(10);
        rescan.processedFiles = i + 1;
        await save(rescan);
      }
    })
    .then(() => {
      return save(complete(rescan));
    })
    .catch((error) => {
      return save(catchError(rescan, error));
    });
};

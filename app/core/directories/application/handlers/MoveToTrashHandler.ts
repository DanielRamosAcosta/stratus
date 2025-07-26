import { DirectoryId } from "../../domain/DirectoryId";
import {
  Command,
  CommandHandler,
  CommandId,
  CommandType,
} from "../../../shared/domain/CommandBus";
import {
  createDirectory,
  deleteDirectory,
  findDirectoryById,
} from "../../../../db/DirectoryRepository";
import { setTimeout } from "node:timers/promises";
import { EntryId } from "../../../shared/domain/EntryId";

export type MoveToTrashCommand = Command<{
  id: EntryId;
}>;

export function createMoveToTrashCommand({
  id,
  entryId,
}: {
  id: CommandId;
  entryId: EntryId;
}): MoveToTrashCommand {
  return {
    id,
    type: CommandType.MOVE_TO_TRASH,
    createdAt: new Date(),
    payload: {
      id: entryId,
    },
  };
}

export const handleMoveToTrash: CommandHandler<MoveToTrashCommand> = async (command): Promise<void> => {
  await setTimeout(250);
  await deleteDirectory(command.payload.id as string);
}

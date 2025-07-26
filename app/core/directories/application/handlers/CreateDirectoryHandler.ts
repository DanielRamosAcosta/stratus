import { DirectoryId } from "../../domain/DirectoryId";
import {
  Command,
  CommandHandler,
  CommandId,
  CommandType,
} from "../../../shared/domain/CommandBus";
import {
  createDirectory,
  findDirectoryById,
} from "../../../../db/DirectoryRepository";
import { setTimeout } from "node:timers/promises";

export type CreateDirectoryCommand = Command<{
  id: DirectoryId;
  name: string;
  parentId: DirectoryId;
}>;

export function createDirectoryCommand({
  id,
  directoryId,
  name,
  parentId,
}: {
  id: CommandId;
  directoryId: DirectoryId;
  name: string;
  parentId: DirectoryId;
}): CreateDirectoryCommand {
  return {
    id,
    type: CommandType.CREATE_DIRECTORY,
    createdAt: new Date(),
    payload: {
      id: directoryId,
      name,
      parentId,
    },
  };
}

export const handleCreateDirectory: CommandHandler<CreateDirectoryCommand> = async (command): Promise<void> => {
  const directory = await findDirectoryById(command.payload.parentId);

  if (!directory) {
    throw new Error(
      `Parent directory with ID ${command.payload.parentId} not found`
    );
  }

  const newDirectory = {
    id: command.payload.id,
    name: command.payload.name,
    owner_id: directory.owner_id, // Assuming the owner is the same as the parent
    parent_id: command.payload.parentId,
    root: false, // This is not a root directory
  };

  await createDirectory(newDirectory);
}

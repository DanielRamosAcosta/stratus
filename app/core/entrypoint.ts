import { handleCreateDirectory } from "./directories/application/handlers/CreateDirectoryHandler";
import { handleMoveToTrash } from "./directories/application/handlers/MoveToTrashHandler";
import {
  Command,
  CommandBus,
  CommandHandler,
  CommandType,
} from "./shared/domain/CommandBus";

const handlers: Record<CommandType, CommandHandler<any>> = {
  [CommandType.CREATE_DIRECTORY]: handleCreateDirectory,
  [CommandType.MOVE_TO_TRASH]: handleMoveToTrash,
};

export async function handle(command: Command) {
  await handlers[command.type](command);
}

export const execute = (commandBus: CommandBus) => async (command: Command) => {
  await commandBus.execute(command);
};

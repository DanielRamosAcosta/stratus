import { handleCreateDirectory } from "./directories/application/handlers/CreateDirectoryHandler";
import { handleMoveToTrash } from "./directories/application/handlers/MoveToTrashHandler";
import { handleRescan } from "./directories/application/handlers/RescanHandler";
import { commandStatus } from "./shared/deleteme";
import {
  Command,
  CommandBus,
  CommandHandler,
  CommandType,
} from "./shared/domain/CommandBus";

const handlers: Record<CommandType, CommandHandler<any>> = {
  [CommandType.CREATE_DIRECTORY]: handleCreateDirectory,
  [CommandType.MOVE_TO_TRASH]: handleMoveToTrash,
  [CommandType.RESCAN]: handleRescan,
};

export async function handle(command: Command) {
    commandStatus.finished = false; // Reset status before processing

    handlers[command.type](command)
    .catch((error) => {
      console.error(`Error handling command ${command.type}:`, error);
      throw error; // Re-throw to let the caller handle it
    })
    .finally(() => {
      commandStatus.finished = true; // Set status to finished after processing
      console.log(`Command ${command.id} finished processing`);
    }); 
}

export const execute = (commandBus: CommandBus) => async (command: Command) => {
  await commandBus.execute(command);
};

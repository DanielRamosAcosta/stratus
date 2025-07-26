import { Identifier } from "./Identifier";

export type CommandId = Identifier<"CommandId", string>;

export function randomCommandId(): CommandId {
  return crypto.randomUUID() as CommandId;
}

export const enum CommandType {
  CREATE_DIRECTORY = "CREATE_DIRECTORY",
  MOVE_TO_TRASH = "MOVE_TO_TRASH",
  RESCAN = "RESCAN",
}

export type CommandPayload = {};

export type Command<Payload extends CommandPayload = CommandPayload> = {
  id: CommandId;
  type: CommandType;
  createdAt: Date;
  payload: Payload;
};

export type CommandHandler<C extends Command> = (payload: C) => Promise<void>;

export interface CommandBus {
  execute(command: Command): Promise<void>;
  register<C extends Command>(
    type: CommandType,
    handler: CommandHandler<C>
  ): void;
}

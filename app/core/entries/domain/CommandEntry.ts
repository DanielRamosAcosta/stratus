import { DirectoryId } from "../../directories/domain/DirectoryId";
import { FileId } from "../../files/domain/FileId";

export type CommandEntryId = FileId | DirectoryId;

export type CommandEntryFile = {
    id: FileId;
    type : "file";
    name: string;
    mimeType: string;
    parentId: DirectoryId;
}

export function isCommandEntryFile(entry: CommandEntry): entry is CommandEntryFile {
    return entry.type === "file";
}

export type CommandEntryDirectory = {
    id: DirectoryId;
    type: "directory";
    name: string;
    parentId: DirectoryId;
};

export function isCommandEntryDirectory(entry: CommandEntry): entry is CommandEntryDirectory {
    return entry.type === "directory";
}

export type CommandEntry = CommandEntryFile | CommandEntryDirectory;

import { DirectoryId } from "../../directories/domain/DirectoryId";
import { FileId } from "../../files/domain/FileId";

export type QuickSearchEntryId = FileId | DirectoryId;

export type QuickSerachEntryFile = {
    id: FileId;
    type : "file";
    name: string;
    mimeType: string;
    parentId: DirectoryId;
}

export function isQuickSearchEntryFile(entry: QuickSearchEntry): entry is QuickSerachEntryFile {
    return entry.type === "file";
}

export type QuickSearchEntryDirectory = {
    id: DirectoryId;
    type: "directory";
    name: string;
    parentId: DirectoryId;
};

export function isQuickSearchEntryDirectory(entry: QuickSearchEntry): entry is QuickSearchEntryDirectory {
    return entry.type === "directory";
}

export type QuickSearchEntry = QuickSerachEntryFile | QuickSearchEntryDirectory;

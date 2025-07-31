import {QuickSearchEntry} from "../domain/CommandEntry";
import * as DirectoryId from "../../directories/domain/DirectoryId";
import {ListEntryResponse} from "./ListEntry";

export interface EntryRepository {
  quickSearch(query: string): Promise<QuickSearchEntry[]>;
  listEntriesOf(directoryId: DirectoryId.DirectoryId): Promise<ListEntryResponse>;
}

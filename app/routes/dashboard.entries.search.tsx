import { CommandEntry } from "../core/entries/domain/CommandEntry";
import { commandSearch } from "../core/entries/infrastructure/EntryRepository";

export function loader(params: { search: string }): Promise<CommandEntry[]> {
    return commandSearch(params.search);
}

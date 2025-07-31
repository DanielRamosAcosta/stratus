import { EntryRepository } from "../domain/EntryRepository";
import * as EntryRepositoryArango from "./EntryRepositoryKysely"

export const entryRepository: EntryRepository = EntryRepositoryArango

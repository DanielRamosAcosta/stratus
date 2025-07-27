import { LoaderFunctionArgs } from "@remix-run/node";
import { CommandEntry } from "../core/entries/domain/CommandEntry";
import { commandSearch } from "../core/entries/infrastructure/EntryRepository";

export function loader({
  request,
}: LoaderFunctionArgs): Promise<CommandEntry[]> {
  const url = new URL(request.url);
  const query = url.searchParams.get("search") ?? "string";

  return commandSearch(query);
}

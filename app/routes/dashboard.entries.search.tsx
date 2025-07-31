import { LoaderFunctionArgs } from "@remix-run/node";
import { QuickSearchEntry } from "../core/entries/domain/CommandEntry";
import { quickSearch } from "../core/entries/infrastructure/EntryRepository";

export function loader({
  request,
}: LoaderFunctionArgs): Promise<QuickSearchEntry[]> {
  const url = new URL(request.url);
  const query = url.searchParams.get("search") ?? "string";

  return quickSearch(query);
}

import {LoaderFunctionArgs} from "@remix-run/node";
import {QuickSearchEntry} from "~/core/entries/domain/CommandEntry";
import {entryRepository} from "~/core/entries/infrastructure";

export function loader({
  request,
}: LoaderFunctionArgs): Promise<QuickSearchEntry[]> {
  const url = new URL(request.url);
  const query = url.searchParams.get("search") ?? "string";
  return entryRepository.quickSearch(query);
}

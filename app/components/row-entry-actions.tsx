import { Download, MoreVertical, Trash2, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Shortcut } from "./shortcut";
import { useFetcher } from "@remix-run/react";
import { useState } from "react";
import { PlatformShortcut, useShortcut } from "../providers/ShortcutProvider";
import { Input } from "./ui/input";

export function RowEntryActions({
  entryId,
  isSelected,
}: {
  entryId: string;
  isSelected: boolean;
}) {
  const fetcher = useFetcher<{ ok: boolean }>();
  const [open, setOpen] = useState(false);

  const shortcut: PlatformShortcut = {
    mac: { meta: true, key: "Backspace" },
    other: { ctrl: true, key: "Backspace" },
  };

  const isSubmitting = fetcher.state === "submitting";

  useShortcut(shortcut, () => {
    if (open) {
      fetcher.submit(
        { entryId },
        { method: "delete", action: "/dashboard/folders/entries" }
      );
    }
  }, [open]);

  return (
    <DropdownMenu open={open || isSubmitting} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Download className="h-4 w-4 mr-2" />
          Download
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <fetcher.Form method="delete" action="/dashboard/folders/entries">
          <Input type="hidden" name="entryId" value={entryId} />
          <DropdownMenuItem
            className="text-red-600"
            asChild
            disabled={isSubmitting}
            onSelect={e => {
                e.preventDefault();
            }}
          >
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Move to Trash
              <Shortcut shortcut={shortcut} />
            </button>
          </DropdownMenuItem>
        </fetcher.Form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

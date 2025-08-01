"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { FolderPlus, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { DialogHeader, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { PlatformShortcut, useShortcut } from "../providers/ShortcutProvider";
import { useEffect, useState } from "react";
import { Shortcut } from "./shortcut";
import { useFetcher } from "@remix-run/react";
import { action } from "../routes/dashboard.folders";

type CreateNewFolderProps = {
  parentId: string;
  disableShortcut?: boolean;
};

export function BtnCreateNewFolder({
  parentId,
  disableShortcut = false,
}: CreateNewFolderProps) {
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher<typeof action>();

  const shortcut: PlatformShortcut = {
    mac: { ctrl: true, key: "n" },
    other: { ctrl: true, key: "n" },
  };

  const isSubmitting = fetcher.state === "submitting";
  
  if (!disableShortcut) {
    useShortcut(shortcut, () => {
      setOpen(true);
    });
  }

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      setOpen(false);
    }
  }, [fetcher]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderPlus className="h-4 w-4" />
          New Folder
          <Shortcut shortcut={shortcut} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <fetcher.Form method="post" action="/dashboard/folders">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for the new folder. This will create a new folder in
              the current directory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="folderName"
                name="name"
                placeholder="New folder"
                className="col-span-4"
                autoFocus
              />
              <Input
                id="parentId"
                aria-hidden="true"
                type="hidden"
                name="parentId"
                placeholder="Parent ID"
                className="col-span-4"
                defaultValue={parentId}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              disabled={isSubmitting}
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
              <Shortcut shortcut={{ key: "Escape" }} />
            </Button>
            <Button
              className="flex items-center gap-2"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create
                  <Shortcut shortcut={{ key: "Enter" }} />
                </>
              )}
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

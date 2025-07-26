"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from "~/components/ui/dialog";
import { FolderPlus, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { DialogHeader, DialogFooter, DialogPortal } from "./ui/dialog";
import { Input } from "./ui/input";
import { useShortcut } from "../providers/ShortcutProvider";
import { useState } from "react";

type CreateNewFolderProps = {
  parentId: string;
};

export function BtnCreateNewFolder({ parentId }: CreateNewFolderProps) {
  const [open, setOpen] = useState(false);

  useShortcut({
    mac: {ctrl: true, key: "n"},
    other: {ctrl: true, key: "n"},
  }, () => {
    console.log("Create new folder shortcut triggered");
    setOpen(true);
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderPlus className="h-4 w-4" />
          New Folder
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <ChevronUp className="h-2 w-2" />N
          </kbd>
        </Button>
      </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form
            method="post"
            action="/dashboard/folders"
            onSubmit={(e) => {
              console.log("Creating new folder");
            }}
          >
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>
                Enter a name for the new folder. This will create a new folder
                in the current directory.
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
                  id="folderDescription"
                  name="parentId"
                  placeholder="Folder description"
                  className="col-span-4"
                  defaultValue={parentId}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="flex items-center gap-2">
                Cancel
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  Esc
                </kbd>
              </Button>
              <Button className="flex items-center gap-2" type="submit">
                <FolderPlus className="h-4 w-4 mr-2" />
                Create
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-primary-foreground/20 bg-primary-foreground/10 px-1.5 font-mono text-[10px] font-medium text-primary-foreground/80">
                  ⏎
                </kbd>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
    </Dialog>
  );
}

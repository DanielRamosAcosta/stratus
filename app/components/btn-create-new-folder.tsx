"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from "~/components/ui/dialog";
import { FolderPlus, ChevronUp, Command } from "lucide-react";
import { Button } from "./ui/button";
import { DialogHeader, DialogFooter, DialogPortal } from "./ui/dialog";
import { Input } from "./ui/input";
import { PlatformShortcut, useShortcut } from "../providers/ShortcutProvider";
import { useState } from "react";
import { platform } from "os";
import { Shortcut } from "./shortcut";

type CreateNewFolderProps = {
  parentId: string;
};

export function BtnCreateNewFolder({ parentId }: CreateNewFolderProps) {
  const [open, setOpen] = useState(false);

  const shortcut: PlatformShortcut = {
    mac: { ctrl: true, key: "n" },
    other: { ctrl: true, key: "n" },
  };

  useShortcut(shortcut, () => {
    console.log("Create new folder shortcut triggered");
    setOpen(true);
  });

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
              <Shortcut shortcut={{ key: "Escape" }} />
            </Button>
            <Button className="flex items-center gap-2" type="submit">
              <FolderPlus className="h-4 w-4 mr-2" />
              Create
              <Shortcut shortcut={{ key: "Enter" }} />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

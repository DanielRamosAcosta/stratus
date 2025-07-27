import { useFetcher, useNavigate } from "@remix-run/react";
import {
  Home,
  HardDrive,
  Users,
  Clock,
  Star,
  Trash2,
  Settings,
  User,
  Plus,
  Upload,
  Search,
  LogOut,
  File,
  Calendar,
  Smile,
  Calculator,
  CreditCard,
  Folder,
  CornerDownLeft,
} from "lucide-react";
import {
  CommandShortcut,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "./ui/command";
import { useState } from "react";
import { loader } from "../routes/dashboard.entries.search";
import { Button } from "./ui/button";
import { Shortcut } from "./shortcut";
import { PlatformShortcut, useShortcut } from "../providers/ShortcutProvider";
import { DialogTitle } from "./ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { set } from "zod";

export function AppCommand() {
  const shortcut: PlatformShortcut = {
    mac: { meta: true, key: "k" },
    other: { ctrl: true, key: "k" },
  };

  useShortcut(shortcut, () => {
    setCommandOpen(true);
  });

  const navigate = useNavigate();
  const [commandOpen, setCommandOpen] = useState(false);
  const fetcher = useFetcher<typeof loader>();

  const handleSelect = (callback: () => void) => {
    callback();
    setCommandOpen(false);
  };

  console.log("Command fetcher data:", fetcher.data);

  return (
    <>
      <Button
        variant="outline"
        className="relative max-w-md w-full justify-start text-sm text-muted-foreground shadow-none"
        onClick={() => setCommandOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span>Search in Stratus...</span>
        <div className="flex-1" />
        <Shortcut shortcut={shortcut} />
      </Button>
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <DialogTitle>Command Palette</DialogTitle>
        <DialogDescription>
          Quickly navigate the app or perform actions without using the mouse.
        </DialogDescription>
        <CommandInput
          placeholder="Type a command or search..."
          onChangeCapture={(event) => {
            // @ts-ignore
            const path = "/dashboard/entries/search?search=" + encodeURIComponent(event.target.value)
            console.log("Loading path:", path);
            fetcher.load(
              path
            );
          }}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() =>
                handleSelect(() =>
                  navigate(
                    "/dashboard/folders/343cbdbd-2160-4e50-8e05-5ea20dfe0e24"
                  )
                )
              }
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSelect(() =>
                  navigate(
                    "/dashboard/folders/343cbdbd-2160-4e50-8e05-5ea20dfe0e24"
                  )
                )
              }
            >
              <HardDrive className="mr-2 h-4 w-4" />
              <span>My Drive</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => navigate("/dashboard/shared"))}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Shared with me</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => navigate("/dashboard/recent"))}
            >
              <Clock className="mr-2 h-4 w-4" />
              <span>Recent files</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSelect(() => navigate("/dashboard/favourites"))
              }
            >
              <Star className="mr-2 h-4 w-4" />
              <span>Favourites</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => navigate("/dashboard/trash"))}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Trash</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() =>
                handleSelect(() => navigate("/dashboard/account"))
              }
            >
              <User className="mr-2 h-4 w-4" />
              <span>Account settings</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSelect(() => navigate("/dashboard/administration"))
              }
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Administration</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() =>
                handleSelect(() => {
                  // TODO: Implement create folder functionality
                  console.log("Create new folder");
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>New folder</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSelect(() => {
                  // TODO: Implement upload files functionality
                  console.log("Upload files");
                })
              }
            >
              <Upload className="mr-2 h-4 w-4" />
              <span>Upload files</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => navigate("/auth/logout"))}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Entries">
            {fetcher.data?.map((item, i) => {
              console.log("Mapping to item:", item);
              if (item.type === "directory") {
                return (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(() => {
                      navigate(`/dashboard/folders/${item.id}`);
                    })}
                  >
                    <Folder className="mr-2 h-4 w-4" />
                    <span>{item.name}</span>
                    {i === 0 && (
                      <CommandShortcut>
                        <CornerDownLeft className="h-3 w-3" />
                      </CommandShortcut>
                    )}
                  </CommandItem>
                );
              }
              if (item.type === "file") {
                return (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(() => {
                      navigate(`/dashboard/files/${item.parentId}`);
                    })}
                  >
                    <File className="mr-2 h-4 w-4" />
                    <span>{item.name}</span>
                    {i === 0 && (
                      <CommandShortcut>
                        <CornerDownLeft className="h-3 w-3" />
                      </CommandShortcut>
                    )}
                  </CommandItem>
                );
              }

              throw new Error(`Unknown entry type: ${item.type}`);
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

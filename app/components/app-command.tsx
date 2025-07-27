import {
  Calendar,
  Smile,
  Calculator,
  User,
  CreditCard,
  Settings,
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
import { setTimeout } from "node:timers/promises";

async function doSearch(query: string) {
  await setTimeout(100); // Simulate a search delay

  const directories = [
    {
      id: "343cbdbd-2160-4e50-8e05-5ea20dfe0e24",
      name: "My Drive",
      type: "directory",
    },
    {
      id: "60d6ca60-499a-4155-af9a-abaced8f3b45",
      name: "Documents",
      type: "directory",
    },
    {
      id: "759129d0-7de3-4ec0-933a-e2ae57b917a4",
      name: "Images",
      type: "directory",
    },
    {
      id: "4bde9b37-6251-4f24-9802-fc0026f1dcdd",
      name: "Books",
      type: "directory",
    },
  ];

  const files = [
    {
      id: "1",
      name: "Resume.pdf",
      parentId: "343cbdbd-2160-4e50-8e05-5ea20dfe0e24",
      type: "file",
    },
    {
      id: "2",
      name: "Vacation.jpg",
      parentId: "759129d0-7de3-4ec0-933a-e2ae57b917a4",
      type: "file",
    },
    {
      id: "3",
      name: "Song.mp3",
      parentId: "759129d0-7de3-4ec0-933a-e2ae57b917a4",
      type: "file",
    },
    {
      id: "4",
      name: "Movie.mp4",
      parentId: "759129d0-7de3-4ec0-933a-e2ae57b917a4",
      type: "file",
    },
  ];

  return [...directories, ...files].filter((entry) =>
    entry.name.toLowerCase().includes(query.toLowerCase())
  );
}

export function AppCommand({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Calendar />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <Smile />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem>
            <Calculator />
            <span>Calculator</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CreditCard />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

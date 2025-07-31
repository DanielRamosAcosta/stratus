import { useFetcher, useNavigate } from "@remix-run/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Home,
  HardDrive,
  Users,
  Clock,
  Star,
  Trash2,
  Settings,
  User,
  Search,
  Folder,
  BadgeCheck,
  Shield,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "./ui/command";
import { ChangeEvent, useState } from "react";
import { loader } from "../routes/dashboard.entries.search";
import { Button } from "./ui/button";
import { Shortcut } from "./shortcut";
import { PlatformShortcut, useShortcut } from "../providers/ShortcutProvider";
import { DialogTitle } from "./ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { MimeIcon } from "./mime-icon";

type CommandEntry = {
  id: string;
  name: string;
  group: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

export function AppCommand() {
  const shortcut: PlatformShortcut = {
    mac: { meta: true, key: "k" },
    other: { ctrl: true, key: "k" },
  };

  useShortcut(shortcut, () => {
    setCommandOpen(true);
  });

  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);
  const fetcher = useFetcher<typeof loader>();

  const handleSelect = (callback: () => void) => {
    callback();
    setCommandOpen(false);
    setQuery("");
  };

  const fixedCommandEntries: CommandEntry[] = [
    {
      id: "home",
      name: "Home",
      group: "Navigation",
      icon: <Home className="mr-2 h-4 w-4" />,
      onSelect: () => handleSelect(() => navigate("/dashboard/folders/343cbdbd-2160-4e50-8e05-5ea20dfe0e24")),
    },
    {
      id: "my-drive",
      name: "My Drive",
      group: "Navigation",
      icon: <HardDrive className="mr-2 h-4 w-4" />,
      onSelect: () => handleSelect(() => navigate("/dashboard/folders/343cbdbd-2160-4e50-8e05-5ea20dfe0e24")),
    },
    {
      id: "shared-with-me",
      name: "Shared with me",
      group: "Navigation",
      icon: <Users className="mr-2 h-4 w-4" />,
      onSelect: () => handleSelect(() => navigate("/dashboard/shared")),
    },
    {
      id: "recent-files",
      name: "Recent files",
      group: "Navigation",
      icon: <Clock className="mr-2 h-4 w-4" />,
      onSelect: () => handleSelect(() => navigate("/dashboard/recent")),
    },
    {
      id: "favourites",
      name: "Favourites",
      group: "Navigation",
      icon: <Star className="mr-2 h-4 w-4" />,
      onSelect: () => handleSelect(() => navigate("/dashboard/favourites")),
    },
    {
      id: "trash",
      name: "Trash",
      group: "Navigation",
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onSelect: () => handleSelect(() => navigate("/dashboard/trash")),
    },
    {
      id: "account",
      name: "Account",
      group: "Settings",
      icon: <BadgeCheck className="mr-2 h-4 w-4" />,
      onSelect: () => handleSelect(() => navigate("/dashboard/account")),
    },
    {
      id: "settings",
      name: "Settings",
      group: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
      onSelect: () => handleSelect(() => navigate("/dashboard/settings")),
    },
    {
      id: "administration",
      name: "Administration",
      group: "Settings",
      icon: <Shield className="mr-2 h-4 w-4" />,
      onSelect: () => handleSelect(() => navigate("/dashboard/administration")),
    },
  ];

  const fixedFilteredCommandEntries: CommandEntry[] = fixedCommandEntries.filter(
    (entry) => {
      return new RegExp(query, "i").test(entry.name)
    }
  );

  const mappedEntries = (fetcher.data ?? []).map((item): CommandEntry => ({
    id: item.id,
    name: item.name,
    group: "Files & Folders",
    icon: item.type === "directory" ? (
      <Folder className="mr-2 h-4 w-4" />
    ) : (
      <MimeIcon mimeType={item.mimeType} className="mr-2 h-4 w-4" />
    ),
    onSelect: () => handleSelect(() => {
      if (item.type === "directory") {
        navigate(`/dashboard/folders/${item.id}`);
      }
      if (item.type === "file") {
        console.log(item, "Navigating to file");
        navigate(`/dashboard/folders/${item.parentId}`);
      }
    }),
  }));

  const alllCommandEntries = [
    ...fixedFilteredCommandEntries,
    ...mappedEntries,
  ];

  const grouped = Object.groupBy(alllCommandEntries, (entry) => entry.group) as Record<
    string,
    CommandEntry[]
  >;

  const groupedArr = Object.entries(grouped)

  console.log("Grouped command entries:", groupedArr); 

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
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen} shouldFilter={false}>
        <VisuallyHidden>
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>
            Quickly navigate the app or perform actions without using the mouse.
          </DialogDescription>
        </VisuallyHidden>
        <CommandInput
          placeholder="Type a command or search..."
          onChangeCapture={(event: ChangeEvent<HTMLInputElement>) => {
            fetcher.submit({
              search: event.target.value,
            }, {
              action: "/dashboard/entries/search",
            });
            setQuery(event.target.value);
          }}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {groupedArr.map(([group, entries], groupIndex) => (
            <CommandGroup key={group} heading={group}>
              {entries.map((entry, entryIndex) => (
                <CommandItem
                  key={entry.id}
                  onSelect={() => {
                    entry.onSelect();
                  }}
                >
                  {entry.icon}
                  <span>{entry.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

import { useNavigate } from "@remix-run/react";
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

export function AppCommand({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const navigate = useNavigate();

  const handleSelect = (callback: () => void) => {
    callback();
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => handleSelect(() => 
            navigate('/dashboard/folders/343cbdbd-2160-4e50-8e05-5ea20dfe0e24')
          )}>
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => 
            navigate('/dashboard/folders/343cbdbd-2160-4e50-8e05-5ea20dfe0e24')
          )}>
            <HardDrive className="mr-2 h-4 w-4" />
            <span>My Drive</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => 
            navigate('/dashboard/shared')
          )}>
            <Users className="mr-2 h-4 w-4" />
            <span>Shared with me</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => 
            navigate('/dashboard/recent')
          )}>
            <Clock className="mr-2 h-4 w-4" />
            <span>Recent files</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => 
            navigate('/dashboard/favourites')
          )}>
            <Star className="mr-2 h-4 w-4" />
            <span>Favourites</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => 
            navigate('/dashboard/trash')
          )}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Trash</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => handleSelect(() => 
            navigate('/dashboard/account')
          )}>
            <User className="mr-2 h-4 w-4" />
            <span>Account settings</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => 
            navigate('/dashboard/administration')
          )}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Administration</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => handleSelect(() => {
            // TODO: Implement create folder functionality
            console.log("Create new folder");
          })}>
            <Plus className="mr-2 h-4 w-4" />
            <span>New folder</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => {
            // TODO: Implement upload files functionality
            console.log("Upload files");
          })}>
            <Upload className="mr-2 h-4 w-4" />
            <span>Upload files</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => 
            navigate('/dashboard/search')
          )}>
            <Search className="mr-2 h-4 w-4" />
            <span>Search anywhere</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => 
            navigate('/auth/logout')
          )}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

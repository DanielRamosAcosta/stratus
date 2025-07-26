import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { data, redirect, json } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { 
  Folder, 
  File, 
  Link, 
  MoreVertical, 
  Upload, 
  FolderPlus, 
  Grid3X3,
  List,
  Download,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  RefreshCw
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { sessionStorage } from "~/services/auth.server";
import { findChildrenDirectories, findDirectoryContents, getDirectoryPath, createDirectory } from "../db/DirectoryRepository";
import { handle } from "../core/entrypoint";
import { createDirectoryCommand } from "../core/directories/application/handlers/CreateDirectoryHandler";
import { randomCommandId } from "../core/shared/domain/CommandBus";
import { DirectoryId, randomDirectoryId } from "../core/directories/domain/DirectoryId";
import { createMoveToTrashCommand } from "../core/directories/application/handlers/MoveToTrashHandler";
import { EntryId } from "../core/shared/domain/EntryId";

export const meta: MetaFunction = () => {
  return [
    { title: "Stratus - My Drive" },
    { name: "description", content: "File storage and management" },
  ];
};

export async function action({ request, params }: ActionFunctionArgs) {
  console.log("Received action:", { request, params });
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let accessToken = session.get("access_token");
  if (!accessToken) throw redirect("/login");

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create_folder") {
    const folderName = formData.get("folderName")?.toString();
    const parentId = (params.folderId || '343cbdbd-2160-4e50-8e05-5ea20dfe0e24') as DirectoryId;

    if (!folderName || folderName.trim() === "") {
      return json({ error: "Folder name is required" }, { status: 400 });
    }

    try {
      const commandId = randomCommandId();
      await handle(createDirectoryCommand({
        id: commandId,
        directoryId: randomDirectoryId(),
        name: folderName.trim(),
        parentId,
      }))

      return redirect(`/dashboard/folders/${parentId}?commandId=${commandId}`);
    } catch (error) {
      console.error("Error creating directory:", error);
      return json({ error: "Failed to create folder" }, { status: 500 });
    }
  }

  if (intent === "move_to_trash") {
    console.log("Intent to move to trash received");
    const entryId = formData.get("entryId")?.toString();
    if (!entryId) {
      return json({ error: "Entry ID is required" }, { status: 400 });
    }
    console.log("Received intent:", intent, entryId);


    try {
      await handle(createMoveToTrashCommand({
        id: randomCommandId(),
        entryId: entryId as EntryId
      }));

      return json({ success: true });
    } catch (error) {
      console.error("Error moving to trash:", error);
      return json({ error: "Failed to move to trash" }, { status: 500 });
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
}

type EntryDirectory = {
  type: "directory";
  id: string;
  name: string;
  ownerId: string;
  lastModified: Date;
};

type EntryFile = {
  type: "file";
  id: string;
  size: number;
  mimeType: string;
  name: string;
  ownerId: string;
  lastModified: Date;
};


type EntrySymlink = {
  type: "symlink";
  id: string;
  name: string;
};

type Entry = EntryDirectory | EntryFile | EntrySymlink;

type PathSegment = {
  id: string;
  name: string;
};

type LoaderData = {
  folderId: string;
  path: PathSegment[];
  entries: (EntryDirectory | EntryFile | EntrySymlink)[];
};

type SortField = 'name' | 'lastModified';
type SortOrder = 'asc' | 'desc';

interface CreateFolderResponse {
  success?: boolean;
  error?: string;
  directory?: any;
  commandId?: string;
}

export default function FolderView() {
  const loaderData = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const fetcher = useFetcher<CreateFolderResponse>();
  const uploadButtonRef = useRef<HTMLButtonElement>(null);
  const newFolderButtonRef = useRef<HTMLButtonElement>(null);
  const [isMac, setIsMac] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isPollingCommand, setIsPollingCommand] = useState(false);

  // Detect if user is on Mac
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // Add keyboard shortcuts for upload and new folder
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log("Key pressed:", event.key);
      // Upload shortcut
      if ((event.metaKey || event.ctrlKey) && event.key === 'u') {
        event.preventDefault();
        uploadButtonRef.current?.click();
      }
      
      // New folder shortcut - Cmd/Ctrl+N
      if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault();
        setIsNewFolderDialogOpen(true);
      }
      
      // Alt New folder shortcut - Alt+Shift+N
      if (event.altKey && event.shiftKey && event.key === 'N') {
        event.preventDefault();
        setIsNewFolderDialogOpen(true);
      }
      
      // Close dialog with Escape key
      if (event.key === 'Escape' && isNewFolderDialogOpen) {
        event.preventDefault();
        setIsNewFolderDialogOpen(false);
        setNewFolderName("");
      }
      
      // Navigate with Enter key when item is selected
      if (event.key === 'Enter' && selectedEntryId && !isNewFolderDialogOpen) {
        event.preventDefault();
        const selectedEntry = loaderData.entries.find(entry => entry.id === selectedEntryId);
        if (selectedEntry) {
          handleEntryDoubleClick(selectedEntry);
        }
      }
      
      // Clear selection with Escape key
      if (event.key === 'Escape' && selectedEntryId && !isNewFolderDialogOpen) {
        event.preventDefault();
        setSelectedEntryId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNewFolderDialogOpen, selectedEntryId, loaderData.entries]);

  // Handle folder creation response
  useEffect(() => {
    if (fetcher.data && fetcher.data.success && fetcher.data.commandId) {
      // Start polling for command completion
      const commandId = fetcher.data.commandId;
      setIsPollingCommand(true);
      
      const pollCommand = async () => {
        try {
          const response = await fetch(`/meta/commands/${commandId}`);
          const result = await response.json();
          
          if (result.finished) {
            setIsPollingCommand(false);
            setIsNewFolderDialogOpen(false);
            setNewFolderName("");
            window.location.reload();
          } else {
            // Continue polling after 1 second
            setTimeout(pollCommand, 1000);
          }
        } catch (error) {
          console.error("Error polling command:", error);
          // Fallback: close dialog after error
          setIsPollingCommand(false);
          setIsNewFolderDialogOpen(false);
          setNewFolderName("");
          window.location.reload();
        }
      };
      
      // Start polling after a short delay
      setTimeout(pollCommand, 500);
    }
  }, [fetcher.data]);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      fetcher.submit(
        { 
          intent: "create_folder", 
          folderName: newFolderName.trim() 
        },
        { method: "post" }
      );
    }
  };

  const handleMoveToTrash = (entryId: string) => {
    console.log("Moving to trash:", entryId);
    fetcher.submit(
      { intent: "move_to_trash", entryId },
      { method: "post" }
    );
  }

  const handleNewFolderClick = () => {
    setIsNewFolderDialogOpen(true);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-muted-foreground" />;
    }
    return sortOrder === 'asc' 
      ? <ChevronUp className="h-4 w-4 ml-1" />
      : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  // Sort entries
  const sortedEntries = [...loaderData.entries].sort((a, b) => {
    let valueA: string | Date;
    let valueB: string | Date;

    if (sortField === 'name') {
      valueA = a.name.toLowerCase();
      valueB = b.name.toLowerCase();
    } else if (sortField === 'lastModified') {
      valueA = 'lastModified' in a ? a.lastModified : new Date(0);
      valueB = 'lastModified' in b ? b.lastModified : new Date(0);
    } else {
      return 0;
    }

    if (valueA < valueB) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  function formatBytes(bytes: number) {
    const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }

    const formatter = new Intl.NumberFormat('es-ES', {
      maximumFractionDigits: 2,
    });

    return `${formatter.format(bytes)} ${units[i]}`;
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getFileIcon = (entry: any) => {
    switch (entry.type) {
      case 'directory':
        return <Folder className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'file':
        return <File className="h-4 w-4 text-muted-foreground" />;
      case 'symlink':
        return <Link className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleEntryClick = (entry: EntryDirectory | EntryFile | EntrySymlink) => {
    // Single click selects the entry
    setSelectedEntryId(entry.id);
  };

  const handleEntryDoubleClick = (entry: EntryDirectory | EntryFile | EntrySymlink) => {
    // Double click navigates
    if (entry.type === 'directory') {
      navigate(`/dashboard/folders/${entry.id}`);
    }
    // TODO: Handle file preview/download for files
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/folders/343cbdbd-2160-4e50-8e05-5ea20dfe0e24">My Drive</BreadcrumbLink>
              </BreadcrumbItem>
              {loaderData.path.map((segment, index) => {
                const pathToSegment = loaderData.path.slice(0, index + 1);
                const href = `/dashboard/folders/${pathToSegment[pathToSegment.length - 1].id}`;
                
                return [
                  <BreadcrumbSeparator key={`sep-${segment.id}`} />,
                  <BreadcrumbItem key={`item-${segment.id}`}>
                    {index === loaderData.path.length - 1 ? (
                      <BreadcrumbPage>{segment.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href}>
                        {segment.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                ];
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b border-border px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button ref={uploadButtonRef}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button ref={newFolderButtonRef} variant="outline" onClick={handleNewFolderClick} className="flex items-center gap-2">
              <FolderPlus className="h-4 w-4" />
              New Folder
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <ChevronUp className="h-2 w-2" />
                N
              </kbd>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon">
              <Grid3X3 className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="icon">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 px-6 py-4 overflow-auto" onClick={() => setSelectedEntryId(null)}>
        <Table onClick={(e) => e.stopPropagation()}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">
                <button 
                  onClick={() => handleSort('name')}
                  className="flex items-center hover:text-foreground transition-colors text-left font-medium"
                >
                  Name
                  {getSortIcon('name')}
                </button>
              </TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>
                <button 
                  onClick={() => handleSort('lastModified')}
                  className="flex items-center hover:text-foreground transition-colors text-left font-medium"
                >
                  Last modified
                  {getSortIcon('lastModified')}
                </button>
              </TableHead>
              <TableHead>File size</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEntries.map((entry, index) => (
              <TableRow 
                key={entry.id || index} 
                className={`hover:bg-muted/50 cursor-pointer ${
                  selectedEntryId === entry.id ? 'bg-accent' : ''
                }`}
                onClick={() => handleEntryClick(entry)}
                onDoubleClick={() => handleEntryDoubleClick(entry)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(entry)}
                    <span>{entry.name}</span>
                    {entry.type === 'file' && (
                      <Badge variant="secondary" className="text-xs">
                        {entry.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {'ownerId' in entry ? entry.ownerId : '—'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {'lastModified' in entry && entry.lastModified ? formatDate(entry.lastModified) : '—'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.type === 'file' ? formatBytes(entry.size) : '—'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
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
                      <DropdownMenuItem className="text-red-600" onSelect={() => handleMoveToTrash(entry.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Move to Trash
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Empty State */}
        {sortedEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Folder className="h-16 w-16 mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2 text-foreground">This folder is empty</h3>
            <p className="text-sm mb-4">Upload files or create a new folder to get started</p>
            <div className="flex space-x-2">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload files
              </Button>
              <Button variant="outline">
                <FolderPlus className="h-4 w-4 mr-2" />
                New folder
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New Folder Dialog */}
      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for the new folder. This will create a new folder in the current directory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="New folder"
                className="col-span-4"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder();
                  }
                }}
                autoFocus
              />
            </div>
            {fetcher.data?.error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded">
                {fetcher.data.error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNewFolderDialogOpen(false);
                setNewFolderName("");
              }}
              disabled={fetcher.state === "submitting" || isPollingCommand}
              className="flex items-center gap-2"
            >
              Cancel
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                Esc
              </kbd>
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || fetcher.state === "submitting" || isPollingCommand}
              className="flex items-center gap-2"
            >
              {(fetcher.state === "submitting" || isPollingCommand) ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {fetcher.state === "submitting" ? "Creating..." : "Processing..."}
                </>
              ) : (
                <>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create
                  <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-primary-foreground/20 bg-primary-foreground/10 px-1.5 font-mono text-[10px] font-medium text-primary-foreground/80">
                    ⏎
                  </kbd>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let accessToken = session.get("access_token");
  if (!accessToken) throw redirect("/login");

  if (params.commandId) {
    console.log("I should wait for command:", params.commandId);
    while (true) {
      const response = await fetch(`/meta/commands/${params.commandId}`);
      const result = await response.json();
      
      if (result.finished) {
        console.log("Command finished:", params.commandId);
        break;
      } else {
        console.log("Command still running, waiting...");
      }
      
      // Wait for 1 second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log("Command completed:", params.commandId);
    // After command completion, redirect to the folder
  }

  const {directories, files} = await findDirectoryContents(params.folderId || 'root');
  const path = await getDirectoryPath(params.folderId || 'root');

  const directoriesEntries = directories.map((dir): EntryDirectory => ({
    type: "directory",
    id: dir.id,
    name: dir.name,
    ownerId: "dani",
    lastModified: new Date(),
  }));

  const fileEntries = files.map((file): EntryFile => ({
    type: "file",
    id: file.id,
    name: file.name,
    ownerId: "dani",
    lastModified: new Date(),
    size: 0,
    mimeType: "text/plain",
  }));

  const entries: Entry[] = [...directoriesEntries, ...fileEntries];

  console.log("Loaded entries for folder:", accessToken);

  return data<LoaderData>({
    folderId: params.folderId || 'root',
    path,
    entries: entries,
  });
}

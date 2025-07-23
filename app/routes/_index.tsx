import type { MetaFunction } from "@remix-run/node";
import { data, redirect } from "@remix-run/node";
import { Button } from "../components/ui/button";
import { sessionStorage } from "../services/auth.server";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { 
  Folder, 
  File, 
  Link, 
  MoreVertical, 
  Upload, 
  FolderPlus, 
  Search,
  Grid3X3,
  List,
  ArrowUpDown,
  Download,
  Trash2,
  Share,
  Star,
  Command,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ThemeToggle } from "../components/theme-toggle";
import { Tooltip } from "../components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

export const meta: MetaFunction = () => {
  return [
    { title: "YAGD - Yet Another Google Drive" },
    { name: "description", content: "File storage and management" },
  ];
};

type EntryDirectory = {
  type: "directory";
  name: string;
  ownerId: string;
  lastModified: Date;
};

type EntryFile = {
  type: "file";
  size: number;
  mimeType: string;
  name: string;
  ownerId: string;
  lastModified: Date;
};

type EntrySymlink = {
  type: "symlink";
  name: string;
};

type PathSegment = {
  id: string;
  name: string;
};

type LoaderData = {
  path: PathSegment[];
  entries: (EntryDirectory | EntryFile | EntrySymlink)[];
};

type SortField = 'name' | 'lastModified';
type SortOrder = 'asc' | 'desc';

export default function Index() {
  const loaderData = useLoaderData<LoaderData>();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const uploadButtonRef = useRef<HTMLButtonElement>(null);
  const newFolderButtonRef = useRef<HTMLButtonElement>(null);
  const [isMac, setIsMac] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Detect if user is on Mac
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // Add keyboard shortcuts for Cmd+K (search), Cmd+U (upload), Cmd+N (new folder)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Search shortcut
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Upload shortcut
      if ((event.metaKey || event.ctrlKey) && event.key === 'u') {
        event.preventDefault();
        uploadButtonRef.current?.click();
      }
      
      // New folder shortcut
      if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault();
        newFolderButtonRef.current?.click();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Si ya estamos ordenando por este campo, cambiar el orden
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es un campo nuevo, empezar con orden ascendente
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

  // Función para ordenar las entradas
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-foreground">YAGD</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Your Drive</BreadcrumbLink>
                </BreadcrumbItem>
                {loaderData.path.map((segment, index) => {
                  // Build hierarchical path for navigation
                  const pathToSegment = loaderData.path.slice(0, index + 1);
                  const href = `/folder/${pathToSegment.map(p => p.id).join('/')}`;
                  
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
          
          <div className="flex items-center space-x-2">
            <Tooltip content="Search files and folders" shortcut={isMac ? "⌘K" : "Ctrl+K"}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search in Drive"
                  className="w-64 pl-9 pr-12"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  {isMac ? (
                    <>
                      <Command className="h-3 w-3" />
                      <span className="text-xs">K</span>
                    </>
                  ) : (
                    'Ctrl+K'
                  )}
                </kbd>
              </div>
            </Tooltip>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b border-border px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tooltip content="Upload files" shortcut={isMac ? "⌘U" : "Ctrl+U"}>
              <Button ref={uploadButtonRef}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </Tooltip>
            <Tooltip content="Create new folder" shortcut={isMac ? "⌘N" : "Ctrl+N"}>
              <Button ref={newFolderButtonRef} variant="outline">
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </Tooltip>
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
      <div className="px-6 py-4">
        <Table>
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
              <TableRow key={index} className="hover:bg-muted/50">
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
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty State for when no files */}
      {loaderData.entries.length === 0 && (
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
  );
}

export async function loader({ request }: { request: Request }) {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let accessToken = session.get("access_token");
  if (!accessToken) throw redirect("/login");
  

  return data({
    path: [
      {
        id: "documentos",
        name: "Documentos"
      },
      {
        id: "remix",
        name: "Remix"
      }
    ] satisfies PathSegment[],
    entries: [
      {
        type: "directory",
        name: "Documentos",
        ownerId: "dani",
        lastModified: new Date("2023-10-01T12:00:00Z"),
      } satisfies EntryDirectory,
      {
        type: "directory",
        name: "Imprimir",
        ownerId: "dani",
        lastModified: new Date("2023-10-01T12:00:00Z"),
      } satisfies EntryDirectory,
      {
        type: "file",
        size: 1024,
        mimeType: "text/plain",
        name: "README.md",
        ownerId: "dani",
        lastModified: new Date("2023-10-01T12:00:00Z"),
      } satisfies EntryFile,
      {
        type: "symlink",
        name: "link-to-readme",
      } satisfies EntrySymlink,
    ]
  });
}

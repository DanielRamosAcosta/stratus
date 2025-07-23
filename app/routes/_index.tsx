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
  Command
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ThemeToggle } from "../components/theme-toggle";
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

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMac, setIsMac] = useState(false);

  // Detect if user is on Mac
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // Add keyboard shortcut for Cmd+K (or Ctrl+K on Windows/Linux)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              {loaderData.path.map((segment, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <span className="mx-1">/</span>}
                  <span className={index === loaderData.path.length - 1 ? "font-medium text-foreground" : ""}>
                    {segment}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
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
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b border-border px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button variant="outline">
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Sort
            </Button>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="px-6 py-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Last modified</TableHead>
              <TableHead>File size</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loaderData.entries.map((entry, index) => (
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
      "/",
      "Documentos",
      "Remix",
    ],
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

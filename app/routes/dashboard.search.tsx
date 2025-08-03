import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { data, redirect } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { 
  Folder, 
  File, 
  Link, 
  MoreVertical, 
  Search,
  Download,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowUpDown
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
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
import { sessionStorage } from "~/core/shared/infrastructure/auth/SessionStorage";

export const meta: MetaFunction = () => {
  return [
    { title: "Stratus - Search Results" },
    { name: "description", content: "Search results in your drive" },
  ];
};

type EntryDirectory = {
  type: "directory";
  id: string;
  name: string;
  ownerId: string;
  lastModified: Date;
  path: string;
};

type EntryFile = {
  type: "file";
  id: string;
  size: number;
  mimeType: string;
  name: string;
  ownerId: string;
  lastModified: Date;
  path: string;
};

type EntrySymlink = {
  type: "symlink";
  id: string;
  name: string;
  path: string;
};

type LoaderData = {
  query: string;
  results: (EntryDirectory | EntryFile | EntrySymlink)[];
};

type SortField = 'name' | 'lastModified';
type SortOrder = 'asc' | 'desc';

export default function SearchResults() {
  const loaderData = useLoaderData<LoaderData>();
  const [searchParams] = useSearchParams();
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

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

  // Sort results
  const sortedResults = [...loaderData.results].sort((a, b) => {
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
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center space-x-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Search results for "{loaderData.query}"
            </h1>
            <p className="text-sm text-muted-foreground">
              {sortedResults.length} {sortedResults.length === 1 ? 'result' : 'results'} found
            </p>
          </div>
        </div>
      </header>

      {/* File List */}
      <div className="flex-1 px-6 py-4 overflow-auto">
        {sortedResults.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">
                  <button 
                    onClick={() => handleSort('name')}
                    className="flex items-center hover:text-foreground transition-colors text-left font-medium"
                  >
                    Name
                    {getSortIcon('name')}
                  </button>
                </TableHead>
                <TableHead className="w-[30%]">Location</TableHead>
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
              {sortedResults.map((entry, index) => (
                <TableRow key={entry.id || index} className="hover:bg-muted/50">
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
                  <TableCell className="text-muted-foreground text-sm">
                    {entry.path}
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
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="h-16 w-16 mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2 text-foreground">No results found</h3>
            <p className="text-sm mb-4">Try different keywords or check your spelling</p>
          </div>
        )}
      </div>
    </div>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let accessToken = session.get("access_token");
  if (!accessToken) throw redirect("/login");

  const url = new URL(request.url);
  const query = url.searchParams.get("query") || "";

  // Mock search results
  const allFiles = [
    {
      type: "directory",
      id: "documentos",
      name: "Documentos",
      ownerId: "dani",
      lastModified: new Date("2023-10-01T12:00:00Z"),
      path: "My Drive",
    } satisfies EntryDirectory,
    {
      type: "file",
      id: "readme",
      size: 1024,
      mimeType: "text/plain",
      name: "README.md",
      ownerId: "dani",
      lastModified: new Date("2023-10-01T12:00:00Z"),
      path: "My Drive",
    } satisfies EntryFile,
    {
      type: "file",
      id: "report",
      size: 2048,
      mimeType: "application/pdf",
      name: "Report.pdf",
      ownerId: "dani",
      lastModified: new Date("2023-09-28T14:20:00Z"),
      path: "My Drive/Documentos",
    } satisfies EntryFile,
    {
      type: "file",
      id: "package",
      size: 512,
      mimeType: "application/json",
      name: "package.json",
      ownerId: "dani",
      lastModified: new Date("2023-10-01T12:00:00Z"),
      path: "My Drive/Documentos/Remix",
    } satisfies EntryFile,
  ];

  // Filter results based on query
  const results = query.trim() 
    ? allFiles.filter(file => 
        file.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return data({
    query,
    results
  });
}

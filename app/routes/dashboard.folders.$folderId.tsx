import type {
  MetaFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/node";
import { data, redirect, json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { Folder, File, Link, Upload, Grid3X3, List } from "lucide-react";
import { Button } from "~/components/ui/button";
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
import { sessionStorage } from "~/services/auth.server";
import {
  findDirectoryContents,
  getDirectoryPath,
} from "../db/DirectoryRepository";
import { moveToTrash } from "../core/directories/application/handlers/MoveToTrashHandler";
import { EntryId } from "../core/shared/domain/EntryId";
import { BtnCreateNewFolder } from "../components/btn-create-new-folder";
import { RowEntryActions } from "../components/row-entry-actions";
import { setTimeout } from "node:timers/promises";

export const meta: MetaFunction = () => {
  return [
    { title: "Stratus - My Drive" },
    { name: "description", content: "File storage and management" },
  ];
};

export async function action({ request, params }: ActionFunctionArgs) {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let accessToken = session.get("access_token");
  if (!accessToken) throw redirect("/login");

  switch (request.method) {
    case "DELETE": {
      const formData = await request.formData();
      const entryId = formData.get("entryId")?.toString();
      if (!entryId) {
        return json({ error: "Entry ID is required" }, { status: 400 });
      }

      try {
        await setTimeout(1000); // Simulate some processing delay
        await moveToTrash({ id: entryId as EntryId });

        return json({ success: true });
      } catch (error) {
        console.error("Error moving to trash:", error);
        return json({ error: "Failed to move to trash" }, { status: 500 });
      }
    }
    default: {
      console.warn("Unsupported action method:", request.method);
      return json({ error: "Unsupported action" }, { status: 405 });
    }
  }
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

export default function FolderView() {
  const loaderData = useLoaderData<LoaderData>();
  const navigate = useNavigate();

  const handleMoveToTrash = (entryId: string) => {
    console.log("Moving to trash:", entryId);
  };

  // Sort entries
  const sortedEntries = loaderData.entries;

  function formatBytes(bytes: number) {
    const units = ["B", "kB", "MB", "GB", "TB", "PB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }

    const formatter = new Intl.NumberFormat("es-ES", {
      maximumFractionDigits: 2,
    });

    return `${formatter.format(bytes)} ${units[i]}`;
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getFileIcon = (entry: any) => {
    switch (entry.type) {
      case "directory":
        return <Folder className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "file":
        return <File className="h-4 w-4 text-muted-foreground" />;
      case "symlink":
        return (
          <Link className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        );
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleEntryClick = () => {
    // Single click selects the entry
  };

  const handleEntryDoubleClick = (
    entry: EntryDirectory | EntryFile | EntrySymlink
  ) => {
    // Double click navigates
    if (entry.type === "directory") {
      navigate(`/dashboard/folders/${entry.id}`);
    }
    // TODO: Handle file preview/download for files
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/folders/343cbdbd-2160-4e50-8e05-5ea20dfe0e24">
                  My Drive
                </BreadcrumbLink>
              </BreadcrumbItem>
              {loaderData.path.map((segment, index) => {
                const pathToSegment = loaderData.path.slice(0, index + 1);
                const href = `/dashboard/folders/${
                  pathToSegment[pathToSegment.length - 1].id
                }`;

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
                  </BreadcrumbItem>,
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
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <BtnCreateNewFolder parentId={loaderData.folderId} />
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
      <div className="flex-1 px-4 py-4 overflow-auto">
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
            {sortedEntries.map((entry, index) => (
              <TableRow
                key={entry.id || index}
                className="hover:bg-muted/50 select-none"
                onDoubleClick={() => handleEntryDoubleClick(entry)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(entry)}
                    <span>{entry.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {"ownerId" in entry ? entry.ownerId : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {"lastModified" in entry && entry.lastModified
                    ? formatDate(entry.lastModified)
                    : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.type === "file" ? formatBytes(entry.size) : "—"}
                </TableCell>
                <TableCell>
                  <RowEntryActions entryId={entry.id} isSelected={false} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Empty State */}
        {sortedEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Folder className="h-16 w-16 mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2 text-foreground">
              This folder is empty
            </h3>
            <p className="text-sm mb-4">
              Upload files or create a new folder to get started
            </p>
            <div className="flex space-x-2">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload files
              </Button>
              <BtnCreateNewFolder
                parentId={loaderData.folderId}
                disableShortcut
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let accessToken = session.get("access_token");
  if (!accessToken) throw redirect("/login");

  const { directories, files } = await findDirectoryContents(
    params.folderId || "root"
  );
  const path = await getDirectoryPath(params.folderId || "root");

  const directoriesEntries = directories.map(
    (dir): EntryDirectory => ({
      type: "directory",
      id: dir.id,
      name: dir.name,
      ownerId: "dani",
      lastModified: new Date(),
    })
  );

  const fileEntries = files.map(
    (file): EntryFile => ({
      type: "file",
      id: file.id,
      name: file.name,
      ownerId: "dani",
      lastModified: new Date(),
      size: 0,
      mimeType: "text/plain",
    })
  );

  const entries: Entry[] = [...directoriesEntries, ...fileEntries];

  return data<LoaderData>({
    folderId: params.folderId || "root",
    path,
    entries: entries,
  });
}

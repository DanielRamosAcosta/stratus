import type {MetaFunction} from "@remix-run/node";
import {data, redirect} from "@remix-run/node";
import {useLoaderData, useNavigate} from "@remix-run/react";
import {z} from "zod";
import {File, Folder, Grid3X3, Link, List, Upload} from "lucide-react";
import {Button} from "~/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "~/components/ui/avatar";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,} from "~/components/ui/breadcrumb";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "~/components/ui/table";
import {moveToTrash} from "~/core/directories/application/MoveToTrash";
import * as EntryId from "../core/shared/domain/EntryId";
import {BtnCreateNewFolder} from "~/components/btn-create-new-folder";
import {RowEntryActions} from "~/components/row-entry-actions";
import {asyncFlow} from "~/utils/asyncFlow";
import {MimeIcon} from "~/components/mime-icon";
import {withProtection} from "~/core/shared/infrastructure/middlewares/withProtection";
import {withMultiplexer} from "~/core/shared/infrastructure/middlewares/withMultiplexer";
import {withValidFormData} from "~/core/shared/infrastructure/middlewares/withValidFormData";
import {entryRepository} from "~/core/entries/infrastructure";
import * as DirectoryId from "../core/directories/domain/DirectoryId";
import {ListEntry,} from "~/core/entries/domain/ListEntry";
import {withValidParams} from "~/core/shared/infrastructure/middlewares/withValidParams";


export const action = asyncFlow(
  withProtection,
  withMultiplexer({
    DELETE: asyncFlow(
      withValidFormData(
        z.object({
          entryId: z.string().transform(EntryId.cast),
        })
      ),
      async ({ user, data }) => {
        await moveToTrash({ id: data.entryId, userId: user.sub });
      }
    ),
  })
);

export const loader = asyncFlow(
    withProtection,
    withValidParams(
        z.object({
          folderId: z.string().transform(DirectoryId.cast),
        })
    ),
    async ({ user, params }) => {
      const { path, entries, owner } = await entryRepository.listEntriesOf(params.folderId);

      if (owner.id !== user.sub) {
        throw redirect(`/error/not-owner`);
      }

      console.log("loaded entries:", entries);

      return data({
        folderId: DirectoryId.cast(params.folderId),
        path,
        entries,
      });
    }
);


export const meta: MetaFunction = () => {
  return [
    { title: "Stratus - My Drive" },
    { name: "description", content: "File storage and management" },
  ];
};


export default function FolderView() {
  const loaderData = useLoaderData<typeof loader>();
  const navigate = useNavigate();
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
        return (
          <MimeIcon
            mimeType={entry.mimeType}
            className="h-4 w-4 text-muted-foreground"
          />
        );
      case "symlink":
        return (
          <Link className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        );
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleEntryDoubleClick = (entry: ListEntry) => {
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
              {loaderData.path.map((segment, index) => {
                const pathToSegment = loaderData.path.slice(0, index + 1);
                const href = `/dashboard/folders/${
                  pathToSegment[pathToSegment.length - 1].id
                }`;

                const name = index === 0 ? "My Drive" : segment.name

                return [
                  index > 0 && (
                    <BreadcrumbSeparator key={`sep-${segment.id}`} />
                  ),
                  <BreadcrumbItem key={`item-${segment.id}`}>
                    {index === loaderData.path.length - 1 ? (
                      <BreadcrumbPage>
                        {name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href}>
                        {name}
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
                  {"owner" in entry ? (
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.owner?.picture} />
                        <AvatarFallback>
                          {entry.owner.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{entry.owner.name}</span>
                    </div>
                  ) : (
                    "—"
                  )}
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


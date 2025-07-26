import { useEffect } from "react";
import {
  useFetcher,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import { data } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { RefreshCw, Database, HardDrive } from "lucide-react";
import { findLatestRescan } from "../db/RescanRepository";
import { isCompleted, isError, isRunning } from "../core/rescans/domain/rescan";


export default function AdministrationPage() {
  const { rescan } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();

  console.log("Rescan status:", rescan);

  const fetcher = useFetcher<void>();

  // refetch rescan status every 5 seconds
  useEffect(() => {
    if (!rescan) return;

    const interval = setInterval(revalidate, 1000);
    return () => clearInterval(interval);
  }, [revalidate, rescan, fetcher.data]);

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
        <p className="text-muted-foreground">
          Manage system settings and maintenance tasks
        </p>
      </div>

      <div className="grid gap-6">
        {/* Files Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Files Management
            </CardTitle>
            <CardDescription>
              Manage file indexing and synchronization between storage and
              database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Rescan Files</h4>
              <p className="text-sm text-muted-foreground">
                This will read from the S3 bucket or local disk and load the
                file metadata into the database. Use this when files have been
                added or modified outside of the application.
              </p>
            </div>

            {isRunning(rescan) &&
              (() => {
                const progress = Math.round(
                  (rescan.processedFiles * 100) / rescan.totalFiles
                );

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Scanning...
                      </span>
                      {rescan.processedFiles && rescan.totalFiles && (
                        <span className="text-muted-foreground">
                          {rescan.processedFiles} / {rescan.totalFiles}
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.floor(progress)}% complete
                    </div>
                  </div>
                );
              })()}

            <fetcher.Form method="post" action="rescan">
              <Button disabled={isRunning(rescan)} className="w-full sm:w-auto">
                {isRunning(rescan) && (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                )}
                {isError(rescan) && (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Rescan
                  </>
                )}
                {rescan == null || isCompleted(rescan) && (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Rescan Files
                  </>
                )}
              </Button>
            </fetcher.Form>
          </CardContent>
        </Card>

        {/* Additional administration sections can be added here */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              View system status and health metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium">Storage Backend</div>
                <div className="text-muted-foreground">MinIO S3</div>
              </div>
              <div>
                <div className="font-medium">Database</div>
                <div className="text-muted-foreground">PostgreSQL</div>
              </div>
              <div>
                <div className="font-medium">Last Rescan</div>
                <div className="text-muted-foreground">
                  {rescan ? "Just now" : "Never"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export async function loader() {
  const ownerId =
    "CiQ5OGIwODBiNS0yNGU0LTRiMGYtOTc5Yy00M2E5YzQyZTNjMTcSBWxvY2Fs";

  const rescan = await findLatestRescan(ownerId);

  console.log("Am I rescanning?");
  return data({ rescan });
}

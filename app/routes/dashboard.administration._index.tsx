import { useEffect, useState } from "react";
import { useFetcher, useLoaderData, useRevalidator } from "@remix-run/react";
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

  console.log("Rescan status:", rescan?.type);

  const fetcher = useFetcher<void>();

  const isSubmitting = fetcher.state === "submitting";

  console.log("isSubmitting, ", isSubmitting);

  useEffect(() => {
    const fetcherFinished = fetcher.state === "idle" && fetcher.data;
    if (!isRunning(rescan) && !fetcherFinished) return;

    const interval = setInterval(revalidate, 1000);
    return () => clearInterval(interval);
  }, [revalidate, rescan, isSubmitting]);

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
                      <span className="text-muted-foreground">
                        {rescan.processedFiles} / {rescan.totalFiles}
                      </span>
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

            {isError(rescan) && (
              <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 border border-red-200 dark:border-red-800">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Rescan Failed
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{rescan.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isCompleted(rescan) && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4 border border-green-200 dark:border-green-800/50">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full">
                      <Database className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                      Rescan Completed Successfully
                    </h3>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-700 dark:text-green-300 font-medium">
                          Files Processed:
                        </span>
                        <span className="ml-2 text-green-600 dark:text-green-400">
                          {rescan.processedFiles}
                        </span>
                      </div>
                      <div>
                        <span className="text-green-700 dark:text-green-300 font-medium">
                          Total Files:
                        </span>
                        <span className="ml-2 text-green-600 dark:text-green-400">
                          {rescan.totalFiles}
                        </span>
                      </div>
                      <div>
                        <span className="text-green-700 dark:text-green-300 font-medium">
                          Started:
                        </span>
                        <span className="ml-2 text-green-600 dark:text-green-400">
                          {rescan.startedAt.toISOString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-green-700 dark:text-green-300 font-medium">
                          Completed:
                        </span>
                        <span className="ml-2 text-green-600 dark:text-green-400">
                          {rescan.finishedAt.toISOString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800/50">
                      <div className="flex items-center justify-end text-xs text-green-600 dark:text-green-400 gap-1">
                        <span>Duration:</span>
                        <span className="font-medium">
                          {Math.round(
                            (rescan.finishedAt.getTime() -
                              rescan.startedAt.getTime()) /
                              1000
                          )}
                          s
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <fetcher.Form method="post" action="rescan">
              <Button
                disabled={isRunning(rescan) || isSubmitting}
                className="w-full sm:w-auto"
              >
                {isRunning(rescan) && (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                )}
                {(isError(rescan) && !isSubmitting) && (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Rescan
                  </>
                )}
                {((rescan == null || isCompleted(rescan)) && !isSubmitting) && (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Rescan Files
                  </>
                )}
                {isSubmitting && (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Starting Rescan...
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

  return data({ rescan });
}

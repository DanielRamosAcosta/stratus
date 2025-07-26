import { useState, useEffect } from "react";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { ActionFunctionArgs, data, json } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { RefreshCw, Database, HardDrive } from "lucide-react";
import { Input } from "../components/ui/input";
import { findRunningRescan } from "../db/RescanRepository";
import { NewRescan } from "../db/types";

type RescanStatus = {
  id: string;
  status: "running" | "error";
  totalFiles: number;
  processedFiles: number;
};

type NoRescanStatus = undefined;

type RescanStatusRunning = {
  type: "running";
  totalFiles: number;
  processedFiles: number;
  startedAt: Date;
};

type RescanStatusCompleted = {
  type: "completed";
  totalFiles: number;
  processedFiles: number;
  startedAt: Date;
  finishedAt: Date;
};

type RescanStatusError = {
  type: "error";
  message: string;
  startedAt: Date;
  finishedAt: Date;
};

type Rescan =
  | NoRescanStatus
  | RescanStatusRunning
  | RescanStatusCompleted
  | RescanStatusError;

function name(params: NewRescan): RescanStatus {
  return {
    id: params.id,
    status: "running",
    totalFiles: params.total_files,
    processedFiles: params.processed_files,
  };
}

export default function AdministrationPage() {
  const scan = useLoaderData<typeof loader>();

  const rescanInitial: RescanStatus | null = scan.scan ? name(scan.scan) : null;

  const fetcher = useFetcher<void>();

  const otherFetcher = useFetcher<typeof loader>();

  const rescan =
    otherFetcher.data && otherFetcher.data.scan
      ? name(otherFetcher.data.scan)
      : rescanInitial;

  const progress = rescan
    ? Math.round((rescan.processedFiles * 100) / rescan.totalFiles)
    : 0;

  // refetch rescan status every 5 seconds
  useEffect(() => {
    if (!rescan) return;

    const interval = setInterval(() => {
      otherFetcher.load("/dashboard/administration");
    }, 1000);
    return () => clearInterval(interval);
  }, [, rescan]);

  const isScanning = (rescan && rescan.status === "running") || false;

  console.log(otherFetcher.data);

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

            {rescan && rescan.status === "running" && (
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
            )}

            <fetcher.Form method="post" action="rescan">
              <Button disabled={isScanning} className="w-full sm:w-auto">
                {isScanning ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
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

  const scan = await findRunningRescan(ownerId);

  console.log("Am I rescanning?");
  return data({ scan });
}

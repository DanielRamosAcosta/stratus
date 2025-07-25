import { useState, useEffect } from "react";
import { Form, useFetcher } from "@remix-run/react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { RefreshCw, Database, HardDrive } from "lucide-react";

interface RescanStatus {
  status: "idle" | "running" | "completed" | "error";
  progress: number;
  message: string;
  totalFiles?: number;
  processedFiles?: number;
}

export default function AdministrationPage() {
  const isScanning = false;

  const rescanStatus: RescanStatus = {
    status: "idle",
    progress: 0,
    message: "Ready to scan",
    totalFiles: 0,
    processedFiles: 0,
  }

  return (
    <div className="space-y-6">
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
              Manage file indexing and synchronization between storage and database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Rescan Files</h4>
              <p className="text-sm text-muted-foreground">
                This will read from the S3 bucket or local disk and load the file metadata into the database. 
                Use this when files have been added or modified outside of the application.
              </p>
            </div>

            {/* Progress indicator */}
            {rescanStatus.status !== "idle" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    {rescanStatus.message}
                  </span>
                  {rescanStatus.processedFiles && rescanStatus.totalFiles && (
                    <span className="text-muted-foreground">
                      {rescanStatus.processedFiles} / {rescanStatus.totalFiles}
                    </span>
                  )}
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${rescanStatus.progress}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.floor(rescanStatus.progress)}% complete
                </div>
              </div>
            )}

            <Form method="post" action="rescan">
              <Button
                disabled={isScanning}
                className="w-full sm:w-auto"
              >
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
            </Form>
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
                  {rescanStatus.status === "completed" ? "Just now" : "Never"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function loader() {
  console.log("Am I rescanning?");
  return json({});
}
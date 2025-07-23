import type { MetaFunction } from "@remix-run/node";
import { data, redirect } from "@remix-run/node";
import { Button } from "../components/ui/button";
import { sessionStorage } from "../services/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
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
  return (
    <p>
      Welcome to Remix 
    </p>
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

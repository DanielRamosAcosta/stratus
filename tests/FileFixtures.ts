import { File } from "../app/core/files/domain/File";
import * as FileId from "../app/core/files/domain/FileId";
import * as DirectoryId from "../app/core/directories/domain/DirectoryId";

export const cleanCodeBook: File = {
  id: FileId.cast("c6c89f2a-4362-4d4b-b55a-f211bdc424e0"),
  size: 1024 * 1024 * 5,
  mimeType: "application/pdf",
  name: "Clean Code.pdf",
  lastModified: new Date("2023-01-01T12:00:00Z"),
  parentId: DirectoryId.cast("e0b24cea-846c-46fe-a28d-a8387a8ccac5"),
};

export const coolWallpaper: File = {
  id: FileId.cast("d1f2e3a4-5678-9abc-def0-1234567890ab"),
  size: 1024 * 1024 * 2,
  mimeType: "image/png",
  name: "Cool Wallpaper.png",
  lastModified: new Date("2023-02-01T12:00:00Z"),
  parentId: DirectoryId.cast("7f9cc1b6-e4f3-4d53-b1c4-8892e761f678"),
};

export const italyPhoto: File = {
  id: FileId.cast("e1f2g3h4-5678-9abc-def0-1234567890cd"),
  size: 1024 * 512,
  mimeType: "image/jpeg",
  name: "Italy Photo.jpg",
  lastModified: new Date("2023-03-01T12:00:00Z"),
  parentId: DirectoryId.cast("7f9cc1b6-e4f3-4d53-b1c4-8892e761f678"),
};

export const highwayToHellSong: File = {
  id: FileId.cast("f1g2h3i4-5678-9abc-def0-1234567890ef"),
  size: 1024 * 1024 * 3,
  mimeType: "audio/mpeg",
  name: "Highway to Hell.mp3",
  lastModified: new Date("2023-04-01T12:00:00Z"),
  parentId: DirectoryId.cast("662dfd1b-4cd6-4649-87e4-b1f0eb2c578d"),
};
export const sampleTextFile: File = {
  id: FileId.cast("g1h2i3j4-5678-9abc-def0-1234567890gh"),
  size: 1024 * 256,
  mimeType: "text/plain",
  name: "Sample Text File.txt",
  lastModified: new Date("2023-05-01T12:00:00Z"),
  parentId: DirectoryId.cast("9a7587c2-6265-4852-ba60-4d44e8d4ef65"),
};

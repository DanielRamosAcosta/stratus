import { setTimeout } from "node:timers/promises";
import * as Rescan from "../domain/Rescan";
import { RescanId } from "../domain/RescanId";
import * as UserId from "~/core/users/domain/UserId";
import { File } from "../../files/domain/File";
import * as FileId from "../../files/domain/FileId";
import * as DirectoryId from "../../directories/domain/DirectoryId";
import * as Directory from "../../directories/domain/Directory";
import { fileRepository } from "../../files/infrastructure";
import { directoryRepository } from "../../directories/infrastructure";
import { rescanRepository } from "../infrastructure";
import { objectProvider } from "../../objects/infrastructure";
import * as ObjectEntry from "../../objects/domain/ObjectEntry";
import * as ObjectDirectory from "../../objects/domain/ObjectDirectory";
import * as ObjectFile from "../../objects/domain/ObjectFile";

export const doRescan = async ({
  id = crypto.randomUUID() as RescanId,
  triggeredBy,
}: {
  id?: RescanId;
  triggeredBy: UserId.UserId;
}): Promise<void> => {
  const rescan = Rescan.launch({ id, ownerId: triggeredBy });
  await rescanRepository.save(rescan);

  try {
    await fileRepository.deleteAll(triggeredBy);
    await directoryRepository.deleteAll(triggeredBy);

    const root = Directory.createRoot({ ownerId: triggeredBy });
    const trash = Directory.createTrash({ ownerId: triggeredBy });

    await directoryRepository.save(root);
    await directoryRepository.save(trash);

    const data = await objectProvider.readDirectory(triggeredBy, "")

    const rootDirectory = ObjectEntry.findDirectoryOrThrow(data, "root/");
    const trashDirectory = ObjectEntry.findDirectoryOrThrow(data, "trash/");

    await readAndImport(rootDirectory, triggeredBy, root.id, rescan);
    await readAndImport(trashDirectory, triggeredBy, trash.id, rescan);

    await rescanRepository.save(Rescan.complete(rescan));
  } catch (error) {
    await rescanRepository.save(Rescan.catchError(rescan, error));
  }
};

const importEntryObject = (ownerId: UserId.UserId, parentId: DirectoryId.DirectoryId, rescan: Rescan.RescanStatusRunning) => async (entry: ObjectEntry.ObjectEntry) => {
  if (ObjectEntry.isFile(entry)) {
    await importObjectFile(ownerId, parentId, rescan, entry);
  } else if (ObjectEntry.isDirectory(entry)) {
    await importObjectDirectory(ownerId, parentId, rescan, entry);
  }
};

async function importObjectFile(ownerId: UserId.UserId, parentId: DirectoryId.DirectoryId, rescan: Rescan.RescanStatusRunning, objectFile: ObjectFile.ObjectFile) {
  const metadata = await objectProvider.readMetadata(ownerId, objectFile.path);
  const file: File = {
    id: FileId.random(),
    name: ObjectFile.getName(objectFile),
    size: metadata.size,
    mimeType: metadata.mimeType,
    lastModified: metadata.lastModified,
    ownerId,
    parentId,
  };
  await fileRepository.save(file);
  rescan.importedFiles += 1;
  await rescanRepository.save(rescan);
}

async function importObjectDirectory(ownerId: UserId.UserId, parentId: DirectoryId.DirectoryId, rescan: Rescan.RescanStatusRunning, objectDirectory: ObjectDirectory.ObjectDirectory) {
  const directory = ObjectDirectory.toDirectory(objectDirectory, ownerId, parentId);
  await directoryRepository.save(directory);
  rescan.importedDirectories += 1;
  await rescanRepository.save(rescan);
  await readAndImport(objectDirectory, ownerId, directory.id, rescan);
}

async function readAndImport(parentObject: ObjectDirectory.ObjectDirectory, ownerId: UserId.UserId, parentId: DirectoryId.DirectoryId, rescan: Rescan.RescanStatusRunning) {
  const entryObjects = await objectProvider.readDirectory(ownerId, parentObject.path)
  await Promise.all(entryObjects.map(importEntryObject(ownerId, parentId, rescan)));
}


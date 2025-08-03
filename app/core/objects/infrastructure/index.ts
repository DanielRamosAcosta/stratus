import {
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { UserId } from "../../users/domain/UserId";
import { ObjectEntry } from "../domain/ObjectEntry";
import { ObjectProvider } from "../domain/ObjectProvider";
import { config } from "../../shared/infrastructure/config";
import { ObjectFile, ObjectFileMetadata } from "../domain/ObjectFile";
import { ObjectDirectory } from "../domain/ObjectDirectory";

export async function readDirectory(
  userId: UserId,
  path: string
): Promise<Array<ObjectEntry>> {
  const bucketConfig = config.S3_BUCKETS.find((c) => c.userId === userId);

  if (!bucketConfig) {
    throw new Error(`No S3 bucket config found for user ${userId}`);
  }

  const command = new ListObjectsV2Command({
    Bucket: bucketConfig.bucketName,
    Prefix: path,
    Delimiter: "/",
  });
  const objectList = await client.send(command);

  const files = objectList.Contents ?? [];
  const directories = objectList.CommonPrefixes ?? [];

  const entryFiles: ObjectFile[] = files.map((file) => ({
    path: file.Key as string,
    type: "file",
  }));

  const entryDirectories: ObjectDirectory[] = directories.map((file) => ({
    path: file.Prefix as string,
    type: "directory",
  }));

  return [...entryDirectories, ...entryFiles];
}

export async function readMetadata(
  userId: UserId,
  path: string
): Promise<ObjectFileMetadata> {
  const bucketConfig = config.S3_BUCKETS.find((c) => c.userId === userId);

  if (!bucketConfig) {
    throw new Error(`No S3 bucket config found for user ${userId}`);
  }

  const headCommand = new HeadObjectCommand({
    Bucket: bucketConfig.bucketName,
    Key: path,
  });

  const metadata = await client.send(headCommand);

  console.log("Metadata for file:", path, metadata.ContentLength);

  return {
    size: metadata.ContentLength ?? 0,
    mimeType: metadata.ContentType || "application/octet-stream",
    lastModified: metadata.LastModified ?? new Date(),
  };
}

export const objectProvider: ObjectProvider = {
  readDirectory,
  readMetadata
};

const client = new S3Client({
  region: "us-east-1", // Cambia esto según tu región
  endpoint: "http://localhost:9000", // tu endpoint MinIO
  credentials: {
    accessKeyId: "minioadmin", // tu access key
    secretAccessKey: "minioadmin", // tu secret key
  },
  forcePathStyle: true, // IMPORTANTE para MinIO
});

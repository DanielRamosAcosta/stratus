import { setTimeout } from "node:timers/promises";
import * as Rescan from "../domain/rescan";
import { RescanId } from "../domain/RescanId";
import { save } from "../infrastructure/RescanRepositoryKysely";
import { UserId } from "~/core/users/domain/UserId";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { isPresent } from "../../../utils/isPresent";

const client = new S3Client({
  region: "us-east-1", // Cambia esto según tu región
  endpoint: "http://localhost:9000", // tu endpoint MinIO
  credentials: {
    accessKeyId: "minioadmin", // tu access key
    secretAccessKey: "minioadmin", // tu secret key
  },
  forcePathStyle: true, // IMPORTANTE para MinIO
});

export const doRescan = async ({
  id = crypto.randomUUID() as RescanId,
  triggeredBy,
}: {
  id?: RescanId;
  triggeredBy: UserId;
}): Promise<void> => {
  const bucketName = "dani";

  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: "",
    Delimiter: "/",
  });

  const response = await client.send(command);

  const files = (response.Contents ?? [])
  const directories = (response.CommonPrefixes ?? [])

  console.log("Files:", files);
  console.log("Directories:", directories);

  await setTimeout(1000); // Simulate some delay for the rescan process

  const rescan = Rescan.launch({ ownerId: triggeredBy });
  await save(rescan);

  Promise.resolve()
    .then(async () => {
      await setTimeout(100);
    })
    .then(() => {
      return save(Rescan.complete(rescan));
    })
    .catch((error) => {
      return save(Rescan.catchError(rescan, error));
    });
};

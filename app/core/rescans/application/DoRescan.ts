import { save } from "../../../db/RescanRepository";
import { setTimeout } from "node:timers/promises";
import { catchError, complete, launch } from "../domain/rescan";

export const doRescan = async ({
  id,
  ownerId,
}: {
  id: string;
  ownerId: string;
}): Promise<void> => {
  await setTimeout(1000); // Simulate some delay for the rescan process

  const totalFiles = Math.floor(Math.random() * (1000 - 700 + 1)) + 700;

  const rescan = launch({ ownerId, totalFiles });
  await save(rescan);

  Promise.resolve()
    .then(async () => {
      for (let i = 0; i < totalFiles; i++) {
        await setTimeout(10);
        rescan.processedFiles = i + 1;
        await save(rescan);
      }
    })
    .then(() => {
      return save(complete(rescan));
    })
    .catch((error) => {
      return save(catchError(rescan, error));
    });
};

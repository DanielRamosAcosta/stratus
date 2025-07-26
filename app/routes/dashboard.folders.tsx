import { z } from "zod";
import { createDirectory } from "../core/directories/application/handlers/CreateDirectoryHandler";
import { cast } from "../core/directories/domain/DirectoryId";
import { asyncFlow } from "../utils/asyncFlow";
import {
  multiplex,
  protect,
  validateFormData,
} from "../core/shared/infrastructure/RemixController";

export const action = asyncFlow(
  protect,
  multiplex({
    POST: asyncFlow(
      validateFormData(
        z.object({
          id: z.uuid().transform(cast),
          name: z.string().min(1),
          parentId: z.uuid().transform(cast),
        })
      ),
      async ({ auth, data }) => {
        await createDirectory({
          id: data.id,
          name: data.name,
          parentId: data.parentId,
          triggeredBy: auth.sub,
        });
      }
    ),
  })
);

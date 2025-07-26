import { z } from "zod";
import { createDirectory } from "../core/directories/application/CreateDirectory";
import * as DirectoryId from "../core/directories/domain/DirectoryId";
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
          name: z.string().min(1),
          parentId: z.uuid().transform(DirectoryId.cast),
        })
      ),
      async ({ auth, data }) => {
        await createDirectory({
          name: data.name,
          parentId: data.parentId,
          triggeredBy: auth.sub,
        });
      }
    ),
  })
);

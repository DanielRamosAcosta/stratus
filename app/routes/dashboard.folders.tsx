import { z } from "zod";
import { createDirectory } from "../core/directories/application/CreateDirectory";
import * as DirectoryId from "../core/directories/domain/DirectoryId";
import { asyncFlow } from "../utils/asyncFlow";
import { withProtection } from "../core/shared/infrastructure/middlewares/withProtection";
import { withMultiplexer } from "../core/shared/infrastructure/middlewares/withMultiplexer";
import { withValidFormData } from "../core/shared/infrastructure/middlewares/withValidFormData";

export const action = asyncFlow(
  withProtection,
  withMultiplexer({
    POST: asyncFlow(
      withValidFormData(
        z.object({
          name: z.string().min(1),
          parentId: z.string().transform(DirectoryId.cast),
        })
      ),
      async ({ user, data }) => {
        await createDirectory({
          name: data.name,
          parentId: data.parentId,
          triggeredBy: user.sub,
        });
      }
    ),
  })
);

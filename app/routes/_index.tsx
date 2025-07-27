import { redirect } from "@remix-run/node";
import { asyncFlow } from "../utils/asyncFlow";
import { withProtection } from "../core/shared/infrastructure/middlewares/withProtection";
import { getRootDirectory } from "../core/directories/application/GetRootDirectory";

export const loader = asyncFlow(
  withProtection,
  async ({ user }) => {
    const rootDirectoryId = await getRootDirectory({ userId: user.sub })
    throw redirect(`/dashboard/folders/${rootDirectoryId}`);
  }
)

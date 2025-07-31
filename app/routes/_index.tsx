import { redirect } from "@remix-run/node";
import { asyncFlow } from "../utils/asyncFlow";
import { withProtection } from "../core/shared/infrastructure/middlewares/withProtection";
import { getRootOf } from "../core/entries/infrastructure/EntryRepository";
import { populateFiles } from "../utils/populate";

export const loader = asyncFlow(
  withProtection,
  async ({ user }) => {
    const rootDirectoryId = await getRootOf(user.sub);
    throw redirect(`/dashboard/folders/${rootDirectoryId}`);
  }
)

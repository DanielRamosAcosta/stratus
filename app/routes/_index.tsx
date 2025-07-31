import {redirect} from "@remix-run/node";
import {asyncFlow} from "~/utils/asyncFlow";
import {withProtection} from "~/core/shared/infrastructure/middlewares/withProtection";
import {directoryRepository} from "~/core/directories/infrastructure";

export const loader = asyncFlow(
  withProtection,
  async ({ user }) => {
    const root = await directoryRepository.getRootOf(user.sub);

    if (!root) {
      throw new Error("User does not have root, has it been intialized?")
    }

    throw redirect(`/dashboard/folders/${root.id}`);
  }
)

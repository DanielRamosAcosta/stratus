import { doRescan } from "../core/rescans/application/DoRescan";
import { asyncFlow } from "../utils/asyncFlow";
import { withProtection } from "../core/shared/infrastructure/middlewares/withProtection";
import { withMultiplexer } from "../core/shared/infrastructure/middlewares/withMultiplexer";

export const action = asyncFlow(
  withProtection,
  withMultiplexer({
    POST: asyncFlow(async ({ user }) => {
      await doRescan({ triggeredBy: user.sub });
    }),
  })
);

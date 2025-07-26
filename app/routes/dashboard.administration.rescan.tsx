import { doRescan } from "../core/rescans/application/DoRescan";
import { asyncFlow } from "../utils/asyncFlow";
import {
  multiplex,
  protect,
} from "../core/shared/infrastructure/RemixController";

export const action = asyncFlow(
  protect,
  multiplex({
    POST: asyncFlow(async ({ auth }) => {
      await doRescan({ triggeredBy: auth.sub });
    }),
  })
);

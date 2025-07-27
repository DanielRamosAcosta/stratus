import { asyncFlow } from "../../../../utils/asyncFlow";
import { withAccessToken } from "./withAccessToken";
import { withActiveToken } from "./withActiveToken";
import { withUserInfo } from "./withUserInfo";

export const withProtection = asyncFlow(
  withAccessToken,
  withActiveToken,
  withUserInfo
)

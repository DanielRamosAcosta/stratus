import { useRouteLoaderData } from "@remix-run/react";

export function useIsMac() {
  const data = useRouteLoaderData<{ isMac: boolean }>("root");
  
  return { isMac: data?.isMac ?? false };
}

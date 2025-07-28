import {data} from "@remix-run/react";

export function withNoop() {
  return data(null)
}

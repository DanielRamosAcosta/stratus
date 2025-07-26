import { json, LoaderFunctionArgs } from "@remix-run/node";
import { commandStatus } from "../core/shared/deleteme";

export async function loader({ params }: LoaderFunctionArgs) {
  const { commandId } = params;
  
  // Simulate command processing - randomly return finished: true or false
  
  console.log(`Polling command ${commandId}`);
  
  return json({ finished: commandStatus.finished });
}

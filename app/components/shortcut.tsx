import {
  Command,
  ChevronUp,
  Option,
  ArrowBigUp,
  CornerDownLeft,
  Delete
} from "lucide-react";
import { useIsMac } from "../hooks/use-is-mac";
import {
  isPlatformShortcut,
  PlatformShortcut,
} from "../providers/ShortcutProvider";

export function Shortcut({
  shortcut: platformShortcut,
}: {
  shortcut: PlatformShortcut | PlatformShortcut["other"];
}) {
  const { isMac } = useIsMac();

  const shortcut = isPlatformShortcut(platformShortcut)
    ? isMac
      ? platformShortcut.mac
      : platformShortcut.other
    : platformShortcut;

  const meta = shortcut.meta;
  const ctrl = shortcut.ctrl;
  const alt = shortcut.alt;
  const shift = shortcut.shift;
  const key = shortcut.key;

  return (
    <kbd className="hidden sm:inline-flex h-5 select-none items-center rounded border border-current/20 bg-current/10 px-1.5 font-mono text-[10px] font-medium text-current/80">
      {meta && <Command className="!h-3 w-3" />}
      {ctrl && <ChevronUp className="!h-3 w-3" />}
      {alt && <Option className="!h-3 w-3" />}
      {shift && <ArrowBigUp className="!h-3 w-3" />}
      {key === "Enter" && <CornerDownLeft className="!h-3 w-3" />}
      {key === "Escape" && <span className="text-xs">Esc</span>}
      {key === "Backspace" && <Delete className="!h-3 w-3" />}
      {key !== "Enter" && key !== "Escape" && key !== "Backspace" && <span className="text-xs">{key.toUpperCase()}</span>}
    </kbd>
  );
}

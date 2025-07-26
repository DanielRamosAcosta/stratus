import { createContext, useContext, useEffect, useRef } from "react";
import { useRouteLoaderData } from "@remix-run/react";
import { useIsMac } from "../hooks/use-is-mac";
import { register } from "module";

export const enum KeyboardModKey {
  META = "META",
  CTRL = "CTRL",
  ALT = "ALT",
  SHIFT = "SHIFT",
}

type Shortcut = {
  meta?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  key: string;
};

export type PlatformShortcut = {
  mac: Shortcut;
  other: Shortcut;
}

export function isPlatformShortcut(
  shortcut: PlatformShortcut | Shortcut
): shortcut is PlatformShortcut {
  return (shortcut as PlatformShortcut).mac !== undefined && (shortcut as PlatformShortcut).other !== undefined;
}

type ShortcutContextValue = {
  register(shortcut: PlatformShortcut, cb: () => void): void
  unregister(cb: () => void): void
};

const ShortcutContext = createContext<ShortcutContextValue | null>(null);

export const ShortcutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isMac } = useIsMac();
  const registrars = useRef<Array<[PlatformShortcut, () => void]>>([]);
  console.log("isMac", isMac);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      console.log(e.metaKey, e.ctrlKey, e.altKey, e.key);
      const matchedRegistrar = registrars.current.find(([shortcut, cb]) => {
        const matchesMac = isMac && shortcut.mac.key === e.key &&
          (shortcut.mac.meta ? e.metaKey : true) &&
          (shortcut.mac.ctrl ? e.ctrlKey : true) &&
          (shortcut.mac.alt ? e.altKey : true) &&
          (shortcut.mac.shift ? e.shiftKey : true);
        const matchesOther = !isMac && shortcut.other.key === e.key &&
          (shortcut.other.meta ? e.metaKey : true) &&
          (shortcut.other.ctrl ? e.ctrlKey : true) &&
          (shortcut.other.alt ? e.altKey : true) &&
          (shortcut.other.shift ? e.shiftKey : true);

        return matchesMac || matchesOther;
      });

      if (matchedRegistrar) {
        e.preventDefault();
        const [shortcut, cb] = matchedRegistrar;
        console.log("Shortcut matched:", shortcut);
        cb();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const value: ShortcutContextValue = {
    register(shortcut, cb) {
      registrars.current.push([shortcut, cb]);
      console.log("Registered shortcut", shortcut, "for", isMac ? "Mac" : "Other");
      console.log("Current registrars:", registrars.current);
    },
    unregister(cb) {
      console.log("Unregistered shortcut for callback", cb);
      registrars.current = registrars.current.filter(([_, registeredCb]) => registeredCb !== cb);
      console.log("Current registrars after unregister:", registrars.current);
    },
  };

  return (
    <ShortcutContext.Provider value={value}>
      {children}
    </ShortcutContext.Provider>
  );
};

export function useShortcut(shortcut: PlatformShortcut, cb: () => void) {
  const context = useContext(ShortcutContext);
  const { isMac } = useIsMac();
  
  if (!context) {
    throw new Error("useShortcut must be used within a ShortcutProvider");
  }

  useEffect(() => {
    context.register(shortcut, cb);

    return () => {
      context.unregister(cb);
      console.log("Unregistered shortcut", shortcut, "for", isMac ? "Mac" : "Other");
    }
  }, []);

  return {display: isMac ? shortcut.mac : shortcut.other};
}

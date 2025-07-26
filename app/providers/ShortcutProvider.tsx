import { createContext, useContext, useEffect, useRef } from "react";
import { useIsMac } from "../hooks/use-is-mac";

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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      console.log(e.metaKey, e.ctrlKey, e.altKey, e.key);
      const matchedRegistrars = registrars.current.filter(([shortcut, cb]) => {
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

      matchedRegistrars.forEach((matchedRegistrar) => {
        e.preventDefault();
        const [shortcut, cb] = matchedRegistrar;
        cb();
      })
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const value: ShortcutContextValue = {
    register(shortcut, cb) {
      registrars.current.push([shortcut, cb]);
    },
    unregister(cb) {
      registrars.current = registrars.current.filter(([_, registeredCb]) => registeredCb !== cb);
    },
  };

  return (
    <ShortcutContext.Provider value={value}>
      {children}
    </ShortcutContext.Provider>
  );
};

export function useShortcut(shortcut: PlatformShortcut, cb: () => void, dependencies: any[] = []) {
  const context = useContext(ShortcutContext);
  const { isMac } = useIsMac();
  
  if (!context) {
    throw new Error("useShortcut must be used within a ShortcutProvider");
  }

  useEffect(() => {
    context.register(shortcut, cb);

    return () => {
      context.unregister(cb);
    }
  }, dependencies);

  return {display: isMac ? shortcut.mac : shortcut.other};
}

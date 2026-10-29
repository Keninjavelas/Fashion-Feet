"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getThemePreset, ThemePreset } from "@/lib/themeTokens";

type FestivalTheme = "none" | "default" | "diwali" | "holi" | "eid" | "christmas" | "lohri" | "baisakhi";

interface FestivalContextType {
  activeFestival: FestivalTheme;
  setActiveFestival: (theme: FestivalTheme) => void;
  preset: ThemePreset;
}

const FestivalContext = createContext<FestivalContextType>({
  activeFestival: "default",
  setActiveFestival: () => {},
  preset: getThemePreset("default")
});

export const useFestival = () => useContext(FestivalContext);

export function FestivalProvider({
  children,
  initialFestival = "default"
}: {
  children: ReactNode;
  initialFestival?: string;
}) {
  const normalizedInitial = (initialFestival === "none" || !initialFestival) ? "default" : initialFestival;
  const [activeFestival, setActiveFestival] = useState<FestivalTheme>(normalizedInitial as FestivalTheme);

  useEffect(() => {
    if (initialFestival) {
      const normalized = (initialFestival === "none" || !initialFestival) ? "default" : initialFestival;
      setActiveFestival(normalized as FestivalTheme);
    }
  }, [initialFestival]);

  const preset = getThemePreset(activeFestival === "none" ? "default" : activeFestival);

  useEffect(() => {
    const themeAttr = activeFestival === "none" ? "default" : activeFestival;
    document.documentElement.setAttribute("data-theme", themeAttr);
  }, [activeFestival]);

  return (
    <FestivalContext.Provider value={{ activeFestival, setActiveFestival, preset }}>
      {children}
    </FestivalContext.Provider>
  );
}

"use client";

import { useEffect } from "react";

export function AnimationReadyProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Progressive enhancement: Only enable hidden state preparation once JS is active
    document.documentElement.classList.add("animations-ready");
  }, []);

  return <>{children}</>;
}

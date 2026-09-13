"use client";

import { useEffect, useState } from "react";

export function usePreloader(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const reveal = () => {
      if (!cancelled) setReady(true);
    };

    document.fonts.ready.then(reveal, reveal);

    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}

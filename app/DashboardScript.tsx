"use client";

import { useEffect } from "react";

export function DashboardScript() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `/script.js?v=${Date.now()}`;
    script.async = true;
    document.body.append(script);
    return () => script.remove();
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

const MATERIAL_SYMBOLS_URL =
  "https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined";

export default function MaterialSymbolsLoader() {
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>(
      `link[href="${MATERIAL_SYMBOLS_URL}"]`,
    );

    const revealIcons = () => {
      document.documentElement.classList.add("material-symbols-ready");
    };

    const loadStylesheet = () => {
      if (link) {
        if (link.sheet) revealIcons();
        else link.addEventListener("load", revealIcons, { once: true });
        return;
      }

      link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = MATERIAL_SYMBOLS_URL;
      link.addEventListener("load", revealIcons, { once: true });
      document.head.appendChild(link);
    };

    if (document.readyState === "complete") loadStylesheet();
    else window.addEventListener("load", loadStylesheet, { once: true });

    return () => window.removeEventListener("load", loadStylesheet);
  }, []);

  return null;
}

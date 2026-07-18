"use client";

import { useSyncExternalStore } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "bidzone-theme";
const THEME_CHANGE_EVENT = "bidzone:theme-change";

function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

function subscribeToTheme(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key !== THEME_STORAGE_KEY) return;

    const theme: Theme = event.newValue === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    onStoreChange();
  }

  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const isDark = theme === "dark";

  function toggleTheme() {
    const nextTheme: Theme = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      aria-pressed={isDark}
      title={isDark ? "Giao diện sáng" : "Giao diện tối"}
      suppressHydrationWarning
      className="theme-toggle"
    >
      <FiSun className="theme-toggle__sun" aria-hidden="true" />
      <FiMoon className="theme-toggle__moon" aria-hidden="true" />
      <span className="theme-toggle__light-label hidden sm:inline">Sáng</span>
      <span className="theme-toggle__dark-label hidden sm:inline">Tối</span>
    </button>
  );
}

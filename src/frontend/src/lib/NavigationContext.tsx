"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { usePathname } from "next/navigation";

type ParentPage = "home" | "live" | "upcoming" | "results" | "storefront" | null;

interface NavigationContextType {
  parentPage: ParentPage;
  setParentPage: (page: ParentPage) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  parentPage: null,
  setParentPage: () => {},
});

export function useNavigationContext() {
  return useContext(NavigationContext);
}

function getStoredParentPage(): ParentPage {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem("nav_parent_page");
  if (stored && ["home", "live", "upcoming", "results", "storefront"].includes(stored)) {
    return stored as ParentPage;
  }
  return null;
}

function saveParentPage(page: ParentPage) {
  if (typeof window === "undefined") return;
  if (page) {
    sessionStorage.setItem("nav_parent_page", page);
  } else {
    sessionStorage.removeItem("nav_parent_page");
  }
}

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const pathname = usePathname();
  const [parentPage, setParentPageState] = useState<ParentPage>(() => getStoredParentPage());

  const setParentPage = useCallback((page: ParentPage) => {
    setParentPageState(page);
    saveParentPage(page);
  }, []);

  // Auto-detect parent page based on pathname for main listing pages
  useEffect(() => {
    let detected: ParentPage = null;
    
    if (pathname === "/" || pathname === "") {
      detected = "home";
    } else if (pathname.startsWith("/live")) {
      detected = "live";
    } else if (pathname.startsWith("/upcoming")) {
      detected = "upcoming";
    } else if (pathname.startsWith("/results")) {
      detected = "results";
    } else if (pathname.startsWith("/storefront")) {
      detected = "storefront";
    } else if (pathname.startsWith("/auctions/")) {
      // For detail pages, use stored parent page if available
      const stored = getStoredParentPage();
      if (stored) {
        setParentPageState(stored);
        return;
      }
    }
    
    if (detected) {
      setParentPageState(detected);
      saveParentPage(detected);
    }
  }, [pathname]);

  return (
    <NavigationContext.Provider value={{ parentPage, setParentPage }}>
      {children}
    </NavigationContext.Provider>
  );
}

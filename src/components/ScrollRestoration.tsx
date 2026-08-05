import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const scrollPositions: Record<string, number> = {};
const navigationHistory: string[] = [];

export function ScrollRestoration() {
  const location = useLocation();
  const isBack = useRef(false);

  useEffect(() => {
    const key = location.pathname + location.search;
    
    if (navigationHistory.length > 1 && navigationHistory[navigationHistory.length - 2] === key) {
      isBack.current = true;
    } else {
      isBack.current = false;
      if (navigationHistory[navigationHistory.length - 1] !== key) {
        navigationHistory.push(key);
      }
    }

    if (isBack.current && scrollPositions[key] !== undefined) {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositions[key]);
      });
    } else {
      window.scrollTo(0, 0);
    }

    const handleScroll = () => {
      scrollPositions[key] = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      scrollPositions[key] = window.scrollY;
    };
  }, [location.pathname, location.search]);

  return null;
}

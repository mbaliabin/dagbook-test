import React, { useState, useEffect } from "react";
import CalendarPage from "./CalendarPage"; // Твой текущий десктопный календарь
import CalendarPageMobile from "./CalendarPageMobile"; // Будущий мобильный календарь

export default function CalendarPageWrapper() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth <= 768);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  if (isMobile === null) return null;

  return isMobile ? <CalendarPageMobile /> : <CalendarPage />;
}
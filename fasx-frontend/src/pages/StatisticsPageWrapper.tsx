import React, { useState, useEffect } from "react";
// Импортируем именно под тем именем, которое будем использовать в return
import StatisticsPage from "./StatisticsPage";
import StatsPageMobile from "./StatsPageMobile"; // Убедись, что имя файла совпадает

export default function StatisticsPageWrapper() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  if (isMobile === null) return null;

  // Теперь имена совпадают с импортом сверху
  return isMobile ? <StatsPageMobile /> : <StatisticsPage />;
}
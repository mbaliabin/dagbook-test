import React, { useState, useEffect } from "react";
import AccountPage from "./AccountPage"; // Твоя старая десктопная страница
import AccountPageMobile from "./AccountPageMobile"; // Новая мобильная страница

export default function AccountPageWrapper() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWidth = () => {
      // Стандартный порог для планшетов/телефонов
      setIsMobile(window.innerWidth <= 768);
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  // Ждем первой проверки ширины, чтобы не было "прыжка" интерфейса
  if (isMobile === null) return null;

  return isMobile ? <AccountPageMobile /> : <AccountPage />;
}
import React, { useState, useEffect } from "react";
import ProfilePage from "./ProfilePage";
import ProfilePageMobile from "./ProfilePageMobile";

export default function ProfilePageWrapper() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth <= 768);

    checkWidth(); // проверка при монтировании
    window.addEventListener("resize", checkWidth);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  if (isMobile === null) return null; // пока не определили ширину, ничего не рендерим

  return isMobile ? <ProfilePageMobile /> : <ProfilePage />;
}
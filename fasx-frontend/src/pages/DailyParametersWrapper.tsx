import { useState, useEffect } from "react";
import DailyParameters from "./DailyParameters";
import DailyParametersMobile from "./DailyParametersMobile";

export default function DailyParametersWrapper() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();

    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return isMobile ? <DailyParametersMobile /> : <DailyParameters />;
}

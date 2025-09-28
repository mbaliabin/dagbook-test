import { useState, useEffect } from "react";
import DailyParameters from "./DailyParameters";
import DailyParametersMobile from "./DailyParametersMobile";

export default function DailyParametersWrapper() {
  // инициализируем сразу по размеру окна
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);

    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return isMobile ? <DailyParametersMobile /> : <DailyParameters />;
}


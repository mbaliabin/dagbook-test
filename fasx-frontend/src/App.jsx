import { Routes, Route } from "react-router-dom"
import HomePage from "@/pages/HomePage"
// import TrainingPage from "@/pages/TrainingPage"
import ProfilePageWrapper from "@/pages/ProfilePageWrapper" // <-- заменяем импорт
import CalendarPage from "@/pages/CalendarPage"
import FasxLogin from "@/pages/FasxLogin"
import FasxRegister from "@/pages/FasxRegister"
import DailyParameters from "@/pages/DailyParameters" // 👈 новый импорт
import DailyParametersWrapper from "@/pages/DailyParametersWrapper";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<FasxLogin />} />
      {/* <Route path="/training" element={<TrainingPage />} /> */}
      <Route path="/profile" element={<ProfilePageWrapper />} /> {/* <-- здесь */}
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/login" element={<FasxLogin />} />
      <Route path="/register" element={<FasxRegister />} />
      <Route path="/daily" element={<DailyParameters />} /> {/* 👈 новый путь */}
      <Route path="/daily" element={<DailyParametersWrapper />} />
    </Routes>
  )
}


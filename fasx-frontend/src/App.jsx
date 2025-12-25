import { Routes, Route } from "react-router-dom"
import HomePage from "@/pages/HomePage"
import ProfilePageWrapper from "@/pages/ProfilePageWrapper"
// ВОТ ЭТОЙ СТРОЧКИ У ТЕБЯ СЕЙЧАС НЕТ ИЛИ ОНА НЕПРАВИЛЬНАЯ:
import CalendarPageWrapper from "@/pages/CalendarPageWrapper"

import FasxLogin from "@/pages/FasxLogin"
import FasxRegister from "@/pages/FasxRegister"
import DailyParametersWrapper from "@/pages/DailyParametersWrapper"
import StatisticsPageWrapper from "@/pages/StatisticsPageWrapper"
import AccountPageWrapper from "@/pages/AccountPageWrapper"


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<FasxLogin />} />
      <Route path="/profile" element={<ProfilePageWrapper />} />

      {/* Теперь эта строка будет работать */}
      <Route path="/calendar" element={<CalendarPageWrapper />} />

      <Route path="/login" element={<FasxLogin />} />
      <Route path="/register" element={<FasxRegister />} />
      <Route path="/daily" element={<DailyParametersWrapper />} />
      <Route path="/statistics" element={<StatisticsPageWrapper />} />
      <Route path="/account" element={<AccountPageWrapper />} />
    </Routes>
  )
}
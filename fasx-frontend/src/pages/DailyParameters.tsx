import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  User, Brain, Moon, AlertTriangle, Thermometer, Send, Clock,
  Sun, Award, Settings, LogOut, ChevronLeft, ChevronRight,
  Timer, BarChart3, ClipboardList, CalendarDays, CheckCircle2
} from "lucide-react";
import { getUserProfile } from "../api/getUserProfile";

dayjs.locale("ru");

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

const TenButtons = ({ value, onChange, Icon }: { value: number; onChange: (val: number) => void; Icon: any }) => (
  <div className="flex flex-wrap gap-3">
    {[...Array(10)].map((_, i) => {
      const active = i < value;
      return (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all border ${
            active
              ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/40 scale-105"
              : "bg-[#0f0f0f] border-gray-800 hover:border-gray-600 text-gray-500"
          }`}
        >
          <Icon className={`w-5 h-5 ${active ? "text-white" : "text-gray-600"}`} />
        </button>
      );
    })}
  </div>
);

const SingleSelectButton = ({ id, label, Icon, activeId, onClick, activeColor }: any) => {
  const isActive = activeId === id;
  return (
    <button
      onClick={() => onClick(id === activeId ? null : id)}
      className={`px-5 py-4 rounded-2xl flex items-center space-x-4 transition-all border w-full ${
        isActive
          ? `${activeColor} border-transparent shadow-lg scale-[1.02]`
          : "bg-[#0f0f0f] border-gray-800 hover:border-gray-700 text-gray-400"
      }`}
    >
      <div className={`p-2.5 rounded-lg ${isActive ? "bg-white/20" : "bg-gray-800"}`}>
        <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
      </div>
      <span className={`text-[11px] font-black uppercase tracking-[0.1em] ${isActive ? "text-white" : ""}`}>{label}</span>
    </button>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ ---

export default function DailyParameters() {
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL;

  const [profile, setProfile] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [mainParam, setMainParam] = useState<string | null>(null);
  const [physical, setPhysical] = useState(0);
  const [mental, setMental] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(0);
  const [pulse, setPulse] = useState<string>("");
  const [sleepDuration, setSleepDuration] = useState<string>("");
  const [comment, setComment] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (err) { console.error(err); }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchDailyInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const dateStr = selectedDate.format("YYYY-MM-DD");
        const res = await fetch(`${API_URL}/api/daily-information?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          setMainParam(null); setPhysical(0); setMental(0); setSleepQuality(0); setPulse(""); setSleepDuration(""); setComment("");
          return;
        }
        const data = await res.json();
        setMainParam(data.main_param || null);
        setPhysical(Number(data.physical) || 0);
        setMental(Number(data.mental) || 0);
        setSleepQuality(Number(data.sleep_quality) || 0);
        setPulse(data.pulse != null ? String(data.pulse) : "");
        setSleepDuration(data.sleep_duration || "");
        setComment(data.comment || "");
      } catch (err) { console.error(err); }
    };
    fetchDailyInfo();
  }, [selectedDate, API_URL]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/daily-information`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          date: selectedDate.format("YYYY-MM-DD"),
          mainParam, physical, mental, sleepQuality,
          pulse: pulse ? Number(pulse) : null,
          sleepDuration: sleepDuration || null,
          comment: comment || null,
        }),
      });
      if (res.ok) alert("Данные сохранены ✅");
    } catch (err) { alert("Ошибка сохранения"); }
  };

  const menuItems = [
    { label: "Главная", icon: Timer, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white border border-gray-800 shadow-xl overflow-hidden">
              {profile?.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" /> : profile?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{profile?.name || "Загрузка..."}</h1>
              <p className="text-sm text-gray-500 uppercase font-black tracking-[0.2em] text-[10px]">Личные показатели состояния</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#1a1a1d] border border-gray-800 rounded-xl p-1 shadow-sm">
              <button onClick={() => setSelectedDate(selectedDate.subtract(1, "day"))} className="p-3 hover:text-blue-500 transition-colors"><ChevronLeft size={20}/></button>
              <span className="px-6 text-[11px] font-black uppercase tracking-widest min-w-[180px] text-center text-white">
                {selectedDate.format("D MMMM, dddd")}
              </span>
              <button onClick={() => setSelectedDate(selectedDate.add(1, "day"))} className="p-3 hover:text-blue-500 transition-colors"><ChevronRight size={20}/></button>
            </div>
            <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} className="p-3 rounded-xl bg-[#1a1a1d] border border-gray-800 hover:bg-red-500/10 hover:border-red-500/50 text-gray-500 hover:text-red-500 transition-all shadow-sm">
              <LogOut size={22} />
            </button>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex justify-around bg-[#1a1a1d] border border-gray-800 py-3 px-4 rounded-2xl shadow-sm">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path);
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`flex flex-col items-center text-[10px] font-black uppercase tracking-[0.2em] transition-colors py-1 w-24 ${isActive ? "text-blue-500" : "text-gray-500 hover:text-white"}`}>
                <Icon className="w-6 h-6 mb-1.5"/>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTENT GRID - Растягивается на всю доступную ширину до 1600px */}
        <div className="grid lg:grid-cols-4 gap-6 items-stretch">

          {/* SIDEBAR: СТАТУСЫ */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1d] border border-gray-800 p-7 rounded-3xl shadow-xl h-full flex flex-col">
              <div className="flex items-center gap-2 mb-8 text-gray-500">
                <AlertTriangle size={16} className="text-blue-500" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">Основной статус</h2>
              </div>
              <div className="flex flex-col gap-3 flex-grow">
                <SingleSelectButton id="skadet" label="Травма" Icon={AlertTriangle} activeId={mainParam} onClick={setMainParam} activeColor="bg-red-600" />
                <SingleSelectButton id="syk" label="Болезнь" Icon={Thermometer} activeId={mainParam} onClick={setMainParam} activeColor="bg-orange-600" />
                <SingleSelectButton id="paReise" label="В пути" Icon={Send} activeId={mainParam} onClick={setMainParam} activeColor="bg-blue-600" />
                <SingleSelectButton id="hoydedogn" label="Смена пояса" Icon={Clock} activeId={mainParam} onClick={setMainParam} activeColor="bg-purple-600" />
                <SingleSelectButton id="fridag" label="Выходной" Icon={Sun} activeId={mainParam} onClick={setMainParam} activeColor="bg-green-600" />
                <SingleSelectButton id="konkurranse" label="Старт" Icon={Award} activeId={mainParam} onClick={setMainParam} activeColor="bg-yellow-600" />
              </div>

              <div className="mt-10 pt-8 border-t border-gray-800/50 hidden lg:block">
                <p className="text-[10px] text-gray-600 leading-relaxed uppercase font-black tracking-widest text-center">
                  Системный мониторинг состояния
                </p>
              </div>
            </div>
          </div>

          {/* MAIN FORM: ПАРАМЕТРЫ */}
          <div className="lg:col-span-3">
            <div className="bg-[#1a1a1d] border border-gray-800 p-8 md:p-10 rounded-3xl shadow-xl h-full flex flex-col space-y-12">

              <div className="flex items-center gap-2 text-gray-500">
                <Settings size={16} className="text-blue-500" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">Параметры готовности</h2>
              </div>

              <div className="space-y-12 flex-grow">
                <section className="space-y-5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Физическая форма</label>
                    <span className="text-blue-500 font-black text-sm px-3 py-1 bg-blue-500/10 rounded-lg">{physical || 0} / 10</span>
                  </div>
                  <TenButtons value={physical} onChange={setPhysical} Icon={User} />
                </section>

                <section className="space-y-5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Ментальное состояние</label>
                    <span className="text-blue-500 font-black text-sm px-3 py-1 bg-blue-500/10 rounded-lg">{mental || 0} / 10</span>
                  </div>
                  <TenButtons value={mental} onChange={setMental} Icon={Brain} />
                </section>

                <section className="space-y-5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Качество сна</label>
                    <span className="text-blue-500 font-black text-sm px-3 py-1 bg-blue-500/10 rounded-lg">{sleepQuality || 0} / 10</span>
                  </div>
                  <TenButtons value={sleepQuality} onChange={setSleepQuality} Icon={Moon} />
                </section>

                <div className="grid md:grid-cols-2 gap-10 pt-6 border-t border-gray-800/50">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Пульс покоя</label>
                    <input type="number" value={pulse} onChange={(e) => setPulse(e.target.value)} placeholder="60 уд/мин"
                      className="w-full bg-[#0f0f0f] border border-gray-800 p-5 rounded-2xl focus:border-blue-500 outline-none transition-all text-white font-bold text-lg" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Время сна</label>
                    <input type="text" value={sleepDuration} onChange={(e) => setSleepDuration(e.target.value)} placeholder="08:00"
                      className="w-full bg-[#0f0f0f] border border-gray-800 p-5 rounded-2xl focus:border-blue-500 outline-none transition-all text-white font-bold text-lg" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Комментарий к состоянию</label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Как прошло восстановление сегодня? Опишите любые особенности самочувствия..."
                    className="w-full bg-[#0f0f0f] border border-gray-800 p-6 h-36 rounded-2xl focus:border-blue-500 outline-none transition-all text-white resize-none shadow-inner text-base leading-relaxed" />
                </div>
              </div>

              {/* Кнопка сохранения */}
              <div className="pt-6">
                <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.3em] text-xs py-6 rounded-3xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-blue-900/30 active:scale-[0.99]">
                  <CheckCircle2 size={20} />
                  Сохранить за {selectedDate.format("D MMMM")}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
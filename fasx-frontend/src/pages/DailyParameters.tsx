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
  <div className="flex flex-wrap gap-2">
    {[...Array(10)].map((_, i) => {
      const active = i < value;
      return (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all border ${
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
      className={`px-4 py-3 rounded-2xl flex items-center space-x-3 transition-all border w-full ${
        isActive
          ? `${activeColor} border-transparent shadow-lg scale-[1.02]`
          : "bg-[#0f0f0f] border-gray-800 hover:border-gray-700 text-gray-400"
      }`}
    >
      <div className={`p-2 rounded-lg ${isActive ? "bg-white/20" : "bg-gray-800"}`}>
        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-white" : ""}`}>{label}</span>
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
      <div className="max-w-[1400px] mx-auto space-y-6 px-4">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white border border-gray-800 shadow-xl overflow-hidden">
              {profile?.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" /> : profile?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{profile?.name || "Загрузка..."}</h1>
              <p className="text-sm text-gray-500 uppercase font-black tracking-widest text-[9px]">Личные показатели</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#1a1a1d] border border-gray-800 rounded-xl p-1 shadow-sm">
              <button onClick={() => setSelectedDate(selectedDate.subtract(1, "day"))} className="p-2 hover:text-blue-500 transition-colors"><ChevronLeft size={18}/></button>
              <span className="px-4 text-[10px] font-black uppercase tracking-widest min-w-[150px] text-center text-white font-sans">
                {selectedDate.format("D MMMM, dddd")}
              </span>
              <button onClick={() => setSelectedDate(selectedDate.add(1, "day"))} className="p-2 hover:text-blue-500 transition-colors"><ChevronRight size={18}/></button>
            </div>
            <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} className="p-2.5 rounded-xl bg-[#1a1a1d] border border-gray-800 hover:bg-red-500/10 hover:border-red-500/50 text-gray-500 hover:text-red-500 transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex justify-around bg-[#1a1a1d] border border-gray-800 py-2 px-4 rounded-xl shadow-sm">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path);
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`flex flex-col items-center text-[10px] font-black uppercase tracking-widest transition-colors py-1 w-20 ${isActive ? "text-blue-500" : "text-gray-500 hover:text-white"}`}>
                <Icon className="w-5 h-5 mb-1"/>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTENT GRID - С ИСПОЛЬЗОВАНИЕМ items-stretch */}
        <div className="grid lg:grid-cols-4 gap-6 items-stretch">

          {/* SIDEBAR: СТАТУСЫ */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1d] border border-gray-800 p-6 rounded-2xl shadow-xl h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6 text-gray-500">
                <AlertTriangle size={14} className="text-blue-500" />
                <h2 className="text-[10px] font-black uppercase tracking-widest">Основной статус</h2>
              </div>
              <div className="flex flex-col gap-2.5 flex-grow">
                <SingleSelectButton id="skadet" label="Травма" Icon={AlertTriangle} activeId={mainParam} onClick={setMainParam} activeColor="bg-red-600" />
                <SingleSelectButton id="syk" label="Болезнь" Icon={Thermometer} activeId={mainParam} onClick={setMainParam} activeColor="bg-orange-600" />
                <SingleSelectButton id="paReise" label="В пути" Icon={Send} activeId={mainParam} onClick={setMainParam} activeColor="bg-blue-600" />
                <SingleSelectButton id="hoydedogn" label="Смена пояса" Icon={Clock} activeId={mainParam} onClick={setMainParam} activeColor="bg-purple-600" />
                <SingleSelectButton id="fridag" label="Выходной" Icon={Sun} activeId={mainParam} onClick={setMainParam} activeColor="bg-green-600" />
                <SingleSelectButton id="konkurranse" label="Старт" Icon={Award} activeId={mainParam} onClick={setMainParam} activeColor="bg-yellow-600" />
              </div>

              {/* Пояснительный текст внизу левой колонки для баланса */}
              <div className="mt-8 pt-6 border-t border-gray-800/50 hidden lg:block">
                <p className="text-[9px] text-gray-600 leading-relaxed uppercase font-black tracking-widest">
                  Системная отметка состояния помогает выявлять закономерности в тренировочном процессе.
                </p>
              </div>
            </div>
          </div>

          {/* MAIN FORM: ПАРАМЕТРЫ */}
          <div className="lg:col-span-3">
            <div className="bg-[#1a1a1d] border border-gray-800 p-8 rounded-2xl shadow-xl h-full flex flex-col space-y-10">

              <div className="flex items-center gap-2 text-gray-500">
                <Settings size={14} className="text-blue-500" />
                <h2 className="text-[10px] font-black uppercase tracking-widest">Параметры готовности</h2>
              </div>

              <div className="space-y-10 flex-grow">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Физическая форма</label>
                    <span className="text-blue-500 font-bold text-xs">{physical || 0}/10</span>
                  </div>
                  <TenButtons value={physical} onChange={setPhysical} Icon={User} />
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ментальное состояние</label>
                    <span className="text-blue-500 font-bold text-xs">{mental || 0}/10</span>
                  </div>
                  <TenButtons value={mental} onChange={setMental} Icon={Brain} />
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Качество сна</label>
                    <span className="text-blue-500 font-bold text-xs">{sleepQuality || 0}/10</span>
                  </div>
                  <TenButtons value={sleepQuality} onChange={setSleepQuality} Icon={Moon} />
                </section>

                <div className="grid md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Пульс покоя</label>
                    <input type="number" value={pulse} onChange={(e) => setPulse(e.target.value)} placeholder="60 уд/мин"
                      className="w-full bg-[#0f0f0f] border border-gray-800 p-4 rounded-xl focus:border-blue-500 outline-none transition-all text-white font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Время сна</label>
                    <input type="text" value={sleepDuration} onChange={(e) => setSleepDuration(e.target.value)} placeholder="08:00"
                      className="w-full bg-[#0f0f0f] border border-gray-800 p-4 rounded-xl focus:border-blue-500 outline-none transition-all text-white font-bold" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Комментарий</label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Опишите самочувствие или особенности дня..."
                    className="w-full bg-[#0f0f0f] border border-gray-800 p-4 h-28 rounded-xl focus:border-blue-500 outline-none transition-all text-white resize-none shadow-inner" />
                </div>
              </div>

              {/* Кнопка сохранения в самом низу */}
              <div className="pt-4">
                <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-900/30 active:scale-[0.99]">
                  <CheckCircle2 size={18} />
                  Обновить данные за {selectedDate.format("D MMMM")}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
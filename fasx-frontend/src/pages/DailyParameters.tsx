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

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ (Твои оригинальные размеры) ---

const TenButtons = ({ value, onChange, Icon }: { value: number; onChange: (val: number) => void; Icon: any }) => (
  <div className="flex flex-wrap gap-2 md:gap-3">
    {[...Array(10)].map((_, i) => {
      const active = i < value;
      return (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all border ${
            active
              ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/20 scale-105"
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
      <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? "text-white" : ""}`}>{label}</span>
    </button>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ ---

export default function DailyParameters() {
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL;

  const [name, setName] = useState("");
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
        setName(data.name || "Пользователь");
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
    } catch (err) { alert("Ошибка при сохранении ❌"); }
  };

  const menuItems = [
    { label: "Главная", icon: Timer, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans text-xs">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg overflow-hidden border border-gray-800">
              {profile?.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" /> : name.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{name}</h1>
              <p className="text-sm text-gray-400">Личные показатели</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-[#1a1a1d] border border-gray-800 rounded-xl p-1">
              <button onClick={() => setSelectedDate(selectedDate.subtract(1, "day"))} className="p-2 hover:text-blue-500 transition-colors"><ChevronLeft size={18}/></button>
              <span className="px-4 text-[10px] font-black uppercase tracking-widest min-w-[140px] text-center">
                {selectedDate.format("D MMMM, dddd")}
              </span>
              <button onClick={() => setSelectedDate(selectedDate.add(1, "day"))} className="p-2 hover:text-blue-500 transition-colors"><ChevronRight size={18}/></button>
            </div>
            <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} className="p-2.5 rounded-xl bg-[#1a1a1d] border border-gray-800 hover:bg-gray-800 text-gray-400 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex justify-around bg-[#1a1a1d] border border-gray-800 py-2 px-4 rounded-xl shadow-sm">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`flex flex-col items-center text-xs transition-colors py-1 w-20 ${isActive ? "text-blue-500 font-bold" : "text-gray-500 hover:text-white"}`}>
                <Icon className="w-5 h-5 mb-1"/>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* СЕТКА С ИЗМЕНЕННЫМИ ПРОПОРЦИЯМИ (1/4 + 3/4) */}
        <div className="grid lg:grid-cols-4 gap-6 items-stretch">

          {/* СТАТУСЫ (Узкая колонка - col-span-1) */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1d] border border-gray-800 p-5 rounded-2xl shadow-xl h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6 text-gray-400">
                <AlertTriangle size={14} className="text-blue-500" />
                <h2 className="text-[10px] font-black uppercase tracking-widest">Основной статус</h2>
              </div>
              <div className="grid grid-cols-1 gap-2 flex-grow">
                <SingleSelectButton id="skadet" label="Травма" Icon={AlertTriangle} activeId={mainParam} onClick={setMainParam} activeColor="bg-red-600" />
                <SingleSelectButton id="syk" label="Болезнь" Icon={Thermometer} activeId={mainParam} onClick={setMainParam} activeColor="bg-orange-600" />
                <SingleSelectButton id="paReise" label="В пути" Icon={Send} activeId={mainParam} onClick={setMainParam} activeColor="bg-blue-600" />
                <SingleSelectButton id="hoydedogn" label="Часовой пояс" Icon={Clock} activeId={mainParam} onClick={setMainParam} activeColor="bg-purple-600" />
                <SingleSelectButton id="fridag" label="Выходной" Icon={Sun} activeId={mainParam} onClick={setMainParam} activeColor="bg-green-600" />
                <SingleSelectButton id="konkurranse" label="Соревнование" Icon={Award} activeId={mainParam} onClick={setMainParam} activeColor="bg-yellow-600" />
              </div>

              <div className="mt-8 pt-6 border-t border-gray-800/50 hidden lg:block">
                <p className="text-[9px] text-gray-500 leading-relaxed uppercase font-bold tracking-tighter text-center">
                  Выбор статуса помогает системе точнее анализировать влияние внешних факторов на твою форму.
                </p>
              </div>
            </div>
          </div>

          {/* ПОКАЗАТЕЛИ (Широкая колонка - col-span-3) */}
          <div className="lg:col-span-3">
            <div className="bg-[#1a1a1d] border border-gray-800 p-8 rounded-2xl shadow-xl h-full flex flex-col space-y-8">
              <div className="flex items-center gap-2 text-gray-400">
                <Settings size={16} className="text-blue-500" />
                <h2 className="text-xs font-black uppercase tracking-widest">Параметры готовности</h2>
              </div>

              <div className="grid gap-8 flex-grow">
                <section className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <User size={14}/> Физическая готовность
                  </label>
                  <TenButtons value={physical} onChange={setPhysical} Icon={User} />
                </section>

                <section className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Brain size={14}/> Ментальная готовность
                  </label>
                  <TenButtons value={mental} onChange={setMental} Icon={Brain} />
                </section>

                <section className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Moon size={14}/> Качество сна
                  </label>
                  <TenButtons value={sleepQuality} onChange={setSleepQuality} Icon={Moon} />
                </section>

                <div className="grid md:grid-cols-2 gap-6">
                  <section className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Timer size={14}/> Пульс (уд/мин)
                    </label>
                    <input type="number" value={pulse} onChange={(e) => setPulse(e.target.value)} placeholder="60"
                      className="w-full bg-[#0f0f0f] border border-gray-800 p-4 rounded-xl focus:border-blue-500 outline-none transition-all text-white font-bold" />
                  </section>
                  <section className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={14}/> Длительность сна
                    </label>
                    <input type="text" value={sleepDuration} onChange={(e) => setSleepDuration(e.target.value)} placeholder="07:30"
                      className="w-full bg-[#0f0f0f] border border-gray-800 p-4 rounded-xl focus:border-blue-500 outline-none transition-all text-white font-bold" />
                  </section>
                </div>

                <section className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Заметки к дню</label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Как прошло восстановление?..."
                    className="w-full bg-[#0f0f0f] border border-gray-800 p-4 h-32 rounded-xl focus:border-blue-500 outline-none transition-all text-white resize-none" />
                </section>
              </div>

              <div className="pt-4">
                <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/30 active:scale-[0.98]">
                  <CheckCircle2 size={20} />
                  Сохранить параметры
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
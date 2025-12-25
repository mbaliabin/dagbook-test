import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  User, Brain, Moon, AlertTriangle, Thermometer, Send, Clock,
  Sun, Award, ChevronLeft, ChevronRight,
  Timer, BarChart3, ClipboardList, CalendarDays, CheckCircle2, Activity, Edit3
} from "lucide-react";
import { getUserProfile } from "../api/getUserProfile";
import toast, { Toaster } from "react-hot-toast";

dayjs.locale("ru");

const ColorRangeScale = ({ value, onChange, label, Icon }: { value: number; onChange: (val: number) => void; label: string; Icon: any }) => {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center px-0.5">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Icon size={11} className="text-blue-500" />
          <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <span className={`text-[10px] font-black ${value > 7 ? 'text-green-500' : value > 4 ? 'text-yellow-500' : 'text-red-500'}`}>
          {value || 0}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="absolute inset-0 flex gap-0.5 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`flex-1 h-full rounded-sm transition-all duration-300 ${i < value ? (i < 3 ? 'bg-red-500/80' : i < 7 ? 'bg-yellow-500/80' : 'bg-green-500/80') : 'bg-white/5'}`} />
          ))}
        </div>
        <input type="range" min="1" max="10" step="1" value={value || 0} onChange={(e) => onChange(parseInt(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>
    </div>
  );
};

const StatusChip = ({ id, label, Icon, activeId, onClick, activeColor }: any) => {
  const isActive = activeId === id;
  return (
    <button onClick={() => onClick(id === activeId ? null : id)} className={`flex-1 flex flex-col items-center gap-1 py-2 px-0.5 rounded-lg border transition-all ${isActive ? `${activeColor} border-transparent shadow-lg scale-[0.95]` : "bg-[#131316] border-white/[0.03] text-gray-600"}`}>
      <Icon size={12} className={isActive ? "text-white" : "text-gray-600"} />
      <span className="text-[7px] font-black uppercase tracking-tighter leading-none text-center whitespace-nowrap">{label}</span>
    </button>
  );
};

export default function DailyParametersMobile() {
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
  const [sleepHours, setSleepHours] = useState("08");
  const [sleepMinutes, setSleepMinutes] = useState("00");
  const hourRef = useRef<HTMLInputElement>(null);
  const minRef = useRef<HTMLInputElement>(null);
  const [comment, setComment] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
        setName(data.name || "Атлет");
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
          setMainParam(null); setPhysical(0); setMental(0); setSleepQuality(0); setPulse(""); setSleepHours("08"); setSleepMinutes("00"); setComment("");
          return;
        }
        const data = await res.json();
        setMainParam(data.main_param || null);
        setPhysical(Number(data.physical) || 0);
        setMental(Number(data.mental) || 0);
        setSleepQuality(Number(data.sleep_quality) || 0);
        setPulse(data.pulse != null ? String(data.pulse) : "");
        if (data.sleep_duration) {
          const [h, m] = data.sleep_duration.split(':');
          setSleepHours(h || "08");
          setSleepMinutes(m || "00");
        }
        setComment(data.comment || "");
      } catch (err) { console.error(err); }
    };
    fetchDailyInfo();
  }, [selectedDate, API_URL]);

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 2);
    if (parseInt(val) > 23) val = "23";
    setSleepHours(val);
    if (val.length === 2 && minRef.current) minRef.current.focus();
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 2);
    if (parseInt(val) > 59) val = "59";
    setSleepMinutes(val);
  };

  const handleSave = async () => {
    const loadingToast = toast.loading("...", { style: { background: '#131316', color: '#fff', fontSize: '10px' }});
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/daily-information`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          date: selectedDate.format("YYYY-MM-DD"),
          mainParam, physical, mental, sleepQuality,
          pulse: pulse ? Number(pulse) : null,
          sleepDuration: `${sleepHours.padStart(2, '0')}:${sleepMinutes.padStart(2, '0')}`,
          comment: comment || null,
        }),
      });
      if (res.ok) toast.success("OK", { id: loadingToast });
      else toast.error("Error", { id: loadingToast });
    } catch (err) { toast.error("Error", { id: loadingToast }); }
  };

  const menuItems = [
    { label: "Главная", icon: Timer, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Календарь", icon: CalendarDays, path: "/calendar" },
    { label: "Планы", icon: ClipboardList, path: "/planning" },
    { label: "Статы", icon: Activity, path: "/statistics" },
  ];

  const readinessScore = Math.round(((physical + mental + sleepQuality) / 30) * 100);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-200 pb-24 font-sans overflow-x-hidden">
      <Toaster position="top-center" />

      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-[#0a0a0b]/95 backdrop-blur-md border-b border-white/[0.03] px-4 py-2 flex items-center">
        <div className="flex items-center gap-2 shrink-0 pr-2" onClick={() => navigate("/account")}>
          <div className="w-8 h-8 rounded-full border border-white/10 bg-blue-600 flex items-center justify-center overflow-hidden shrink-0">
            {profile?.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="avatar" /> : <span className="text-white text-[10px] font-black">{name.charAt(0)}</span>}
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="flex items-stretch bg-[#131316] rounded-xl border border-white/5 p-0.5 min-h-[40px] w-full max-w-[180px]">
            <button onClick={() => setSelectedDate(selectedDate.subtract(1, "day"))} className="px-2 active:bg-white/5 rounded-lg text-gray-400 active:text-blue-500 transition-colors">
              <ChevronLeft size={16}/>
            </button>
            <div className="flex-1 flex flex-col items-center justify-center px-1 border-x border-white/[0.03]">
              <span className="text-[9px] font-black uppercase tracking-tighter text-white leading-none">{selectedDate.format("D MMM")}</span>
              <span className="text-[6px] font-bold uppercase text-blue-500/80 tracking-[0.1em] mt-0.5">{selectedDate.format("dddd")}</span>
            </div>
            <button onClick={() => setSelectedDate(selectedDate.add(1, "day"))} className="px-2 active:bg-white/5 rounded-lg text-gray-400 active:text-blue-500 transition-colors">
              <ChevronRight size={16}/>
            </button>
          </div>
        </div>
        <div className="w-8 shrink-0" />
      </div>

      <div className="p-3 space-y-4">
        {/* ИНДЕКС ГОТОВНОСТИ */}
        <div className="bg-[#131316] border border-white/[0.05] rounded-xl px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border-2 border-blue-500/20 flex items-center justify-center text-[11px] font-black text-blue-500">{readinessScore}%</div>
            <div>
              <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Готовность</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase italic">Daily Index</p>
            </div>
          </div>
          <Activity size={14} className="text-blue-500/30" />
        </div>

        {/* СТАТУС */}
        <div className="space-y-1.5">
          <h2 className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-700 ml-1">Статус дня</h2>
          <div className="flex w-full gap-1">
            <StatusChip id="skadet" label="Травма" Icon={AlertTriangle} activeId={mainParam} onClick={setMainParam} activeColor="bg-red-600" />
            <StatusChip id="syk" label="Болезнь" Icon={Thermometer} activeId={mainParam} onClick={setMainParam} activeColor="bg-orange-600" />
            <StatusChip id="paReise" label="Путь" Icon={Send} activeId={mainParam} onClick={setMainParam} activeColor="bg-blue-600" />
            <StatusChip id="fridag" label="Отдых" Icon={Sun} activeId={mainParam} onClick={setMainParam} activeColor="bg-green-600" />
            <StatusChip id="konkurranse" label="Старт" Icon={Award} activeId={mainParam} onClick={setMainParam} activeColor="bg-yellow-600" />
          </div>
        </div>

        {/* ПАРАМЕТРЫ */}
        <div className="bg-[#131316] border border-white/[0.05] rounded-2xl p-4 space-y-5 shadow-xl">
          <ColorRangeScale label="Физическое состояние" value={physical} onChange={setPhysical} Icon={User} />
          <ColorRangeScale label="Ментальный настрой" value={mental} onChange={setMental} Icon={Brain} />
          <ColorRangeScale label="Качество сна" value={sleepQuality} onChange={setSleepQuality} Icon={Moon} />

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-black/20 p-2.5 rounded-xl border border-white/5">
              <label className="text-[7px] font-black text-gray-600 uppercase mb-1 block">Пульс пок.</label>
              <input type="tel" value={pulse} onChange={(e) => setPulse(e.target.value.replace(/\D/g, ""))} onFocus={(e) => e.target.select()} placeholder="0" className="w-full bg-transparent text-white font-black text-sm outline-none" />
            </div>
            <div className="bg-black/20 p-2.5 rounded-xl border border-white/5">
              <label className="text-[7px] font-black text-gray-600 uppercase mb-1 block">Сон (ч:м)</label>
              <div className="flex items-center gap-1">
                <input ref={hourRef} type="tel" value={sleepHours} onChange={handleHourChange} onFocus={(e) => e.target.select()} placeholder="00" className="w-5 bg-transparent text-white font-black text-sm outline-none text-center" />
                <span className="text-gray-700 font-black text-xs">:</span>
                <input ref={minRef} type="tel" value={sleepMinutes} onChange={handleMinChange} onFocus={(e) => e.target.select()} placeholder="00" className="w-5 bg-transparent text-white font-black text-sm outline-none text-center" />
              </div>
            </div>
          </div>

          <div className="relative">
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Заметка к дню..." className="w-full bg-black/20 border border-white/5 p-3 h-16 rounded-xl focus:border-blue-500/50 outline-none text-[10px] resize-none text-gray-300" />
            <Edit3 size={10} className="absolute right-3 bottom-3 text-gray-800" />
          </div>

          {/* КОМПАКТНАЯ СЕРАЯ КНОПКА */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleSave}
              className="w-full max-w-[200px] bg-white/10 hover:bg-white/15 text-gray-300 font-bold text-[10px] uppercase tracking-[0.15em] py-3 rounded-xl active:scale-[0.96] transition-all border border-white/5 flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckCircle2 size={12} className="text-blue-500" />
              Сохранить
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-[#131316]/95 backdrop-blur-md border border-white/10 p-1 rounded-xl flex justify-around shadow-2xl">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all ${isActive ? "bg-blue-600/10 text-blue-500" : "text-gray-600"}`}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[7px] font-black uppercase tracking-tighter">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
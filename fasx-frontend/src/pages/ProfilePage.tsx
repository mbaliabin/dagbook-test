import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const mockData = [
  { month: "Май 2025", зона1: 30, зона2: 5, зона3: 2 },
  { month: "Июль 2025", зона1: 28, зона2: 6, зона3: 3 },
  { month: "Авг 2025", зона1: 25, зона2: 8, зона3: 4 },
  { month: "Сен 2025", зона1: 22, зона2: 6, зона3: 5 },
];

export default function StatisticsPage() {
  const [reportType, setReportType] = useState("Общий отчёт");
  const [interval, setInterval] = useState("Месяц");
  const [mode, setMode] = useState("Время");

  const months = [
    "Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек",
  ];

  const enduranceData = [
    { zone: "I1", color: "#3b82f6", data: ["3:20","2:50","4:10","3:45","2:30","4:00","3:10","2:55","3:35","4:20","3:00","3:10"] },
    { zone: "I2", color: "#10b981", data: ["2:15","1:50","2:00","1:40","1:35","1:50","2:10","2:05","2:20","2:30","2:15","2:00"] },
    { zone: "I3", color: "#facc15", data: ["1:40","1:30","1:20","1:25","1:10","1:30","1:45","1:25","1:40","1:50","1:35","1:25"] },
    { zone: "I4", color: "#f97316", data: ["0:45","0:50","0:35","0:40","0:30","0:35","0:50","0:45","0:55","0:50","0:40","0:35"] },
    { zone: "I5", color: "#ef4444", data: ["0:20","0:15","0:25","0:20","0:18","0:20","0:22","0:19","0:25","0:30","0:20","0:18"] },
  ];

  const trainingTypes = [
    "Бег","Лыжи классическим стилем","Лыжи коньковым стилем",
    "Лыжероллеры классическим стилем","Лыжероллеры коньковым стилем",
    "Силовая тренировка","Велосипед","Другое",
  ];

  const trainingTypeData = trainingTypes.map((type) => ({
    type,
    data: Array.from({ length: 12 }, () => `${Math.floor(Math.random() * 4)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`),
  }));

  const toMinutes = (time: string) => {
    const [h,m] = time.split(":").map(Number);
    return h*60+m;
  };

  const toTimeString = (minutes: number) => {
    const h = Math.floor(minutes/60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2,"0")}`;
  };

  const totalByMonth = months.map((_, i) => {
    const total = enduranceData.reduce((sum, zone) => sum + toMinutes(zone.data[i]), 0);
    return toTimeString(total);
  });

  const totalByZone = enduranceData.map(zone => {
    const total = zone.data.reduce((sum, t) => sum + toMinutes(t),0);
    return toTimeString(total);
  });

  const totalTrainingByMonth = months.map((_, i) => {
    const total = trainingTypeData.reduce((sum, type) => sum + toMinutes(type.data[i]),0);
    return toTimeString(total);
  });

  const totalTrainingByType = trainingTypeData.map(t => {
    const total = t.data.reduce((sum,t) => sum + toMinutes(t),0);
    return toTimeString(total);
  });

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Фильтры */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1a1a1d] p-4 rounded-xl border border-gray-700">
            <label className="block text-sm text-gray-400 mb-2 font-semibold">Тип отчёта</label>
            <select
              value={reportType}
              onChange={(e)=>setReportType(e.target.value)}
              className="w-full bg-[#111214] border border-gray-700 rounded px-3 py-2 text-sm text-white"
            >
              <option>Общий отчёт</option>
              <option>Выносливость</option>
              <option>Силовые</option>
            </select>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={mode==="Время"} onChange={()=>setMode("Время")} className="accent-blue-500"/>
                Время
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={mode==="Процент"} onChange={()=>setMode("Процент")} className="accent-blue-500"/>
                Процент
              </label>
              <span>Экспортировать статистику</span>
            </div>
          </div>

          <div className="bg-[#1a1a1d] p-4 rounded-xl border border-gray-700">
            <label className="block text-sm text-gray-400 mb-2 font-semibold">Интервал времени</label>
            <div className="flex items-center gap-3">
              <button className="bg-[#111214] border border-gray-700 rounded px-3 py-2 text-sm">{interval}</button>
              <span className="text-gray-500">— 03.09.2025</span>
            </div>
          </div>
        </div>

        {/* Диаграмма */}
        <div className="bg-[#1a1a1d] p-5 rounded-xl border border-gray-700">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData}>
              <XAxis dataKey="month" stroke="#aaa"/>
              <YAxis stroke="#aaa"/>
              <Tooltip contentStyle={{backgroundColor:"#1a1a1d", border:"1px solid #333"}}/>
              <Legend />
              <Bar dataKey="зона1" stackId="a" fill="#3b82f6"/>
              <Bar dataKey="зона2" stackId="a" fill="#10b981"/>
              <Bar dataKey="зона3" stackId="a" fill="#facc15"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Параметры дня */}
        <div className="bg-[#1a1a1d] p-5 rounded-xl border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100 mb-3">Параметры дня</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse">
              <thead className="text-gray-400 bg-[#141518]">
                <tr>
                  <th className="text-left py-2 px-3 border-r border-gray-700">Состояние</th>
                  <th>Май 2025</th>
                  <th>Июль 2025</th>
                  <th>Авг 2025</th>
                  <th>Сен 2025</th>
                  <th>Среднее/мес</th>
                </tr>
              </thead>
              <tbody>
                {["Болезнь","Травма","Соревнования","Высота","В поездке","Выходной"].map(row=>(
                  <tr key={row} className="border-t border-gray-800 hover:bg-[#1d1e22]/70">
                    <td className="py-2 px-3">{row}</td>
                    <td colSpan={5} className="text-center text-gray-500">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Выносливость */}
        <div className="bg-[#1a1a1d] p-5 rounded-xl border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100 mb-3">Выносливость</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse">
              <thead className="text-gray-400 bg-gradient-to-b from-[#18191c] to-[#131416]">
                <tr>
                  <th className="text-left py-2 px-3 border-r border-gray-700">Зоны</th>
                  {months.map(m=><th key={m} className="py-2 px-2 text-center border-r border-gray-700">{m}</th>)}
                  <th className="py-2 px-2 text-center text-blue-400 border-l border-gray-700">Общее время</th>
                </tr>
              </thead>
              <tbody>
                {enduranceData.map(({zone,color,data},idx)=>(
                  <tr key={zone} className="border-t border-gray-800 hover:bg-[#1d1e22]/70 transition-colors">
                    <td className="py-3 px-3 flex items-center gap-2 border-r border-gray-700">
                      <span className="inline-block w-3 h-3 rounded-full" style={{backgroundColor:color}}></span>
                      {zone}
                    </td>
                    {data.map((t,i)=>(
                      <td key={i} className="py-3 text-center border-r border-gray-700">{t}</td>
                    ))}
                    <td className="py-3 text-center text-blue-400 border-l border-gray-700">{totalByZone[idx]}</td>
                  </tr>
                ))}
                <tr className="bg-[#18191c] border-t border-gray-700 font-semibold text-blue-400">
                  <td className="py-3 px-3 text-left border-r border-gray-700">Общее время</td>
                  {totalByMonth.map((t,i)=><td key={i} className="py-3 text-center border-r border-gray-700">{t}</td>)}
                  <td className="py-3 text-center border-l border-gray-700">{toTimeString(totalByMonth.reduce((s,t)=>s+toMinutes(t),0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Тип тренировки */}
        <div className="bg-[#1a1a1d] p-5 rounded-xl border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100 mb-3">Тип тренировки</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse">
              <thead className="text-gray-400 bg-gradient-to-b from-[#18191c] to-[#131416]">
                <tr>
                  <th className="text-left py-2 px-3 border-r border-gray-700">Тип</th>
                  {months.map(m=><th key={m} className="py-2 px-2 text-center border-r border-gray-700">{m}</th>)}
                  <th className="py-2 px-2 text-center text-blue-400 border-l border-gray-700">Общее время</th>
                </tr>
              </thead>
              <tbody>
                {trainingTypeData.map((t,idx)=>(
                  <tr key={t.type} className="border-t border-gray-800 hover:bg-[#1d1e22]/70 transition-colors">
                    <td className="py-3 px-3 border-r border-gray-700">{t.type}</td>
                    {t.data.map((v,i)=><td key={i} className="py-3 text-center border-r border-gray-700">{v}</td>)}
                    <td className="py-3 text-center text-blue-400 border-l border-gray-700">{totalTrainingByType[idx]}</td>
                  </tr>
                ))}
                <tr className="bg-[#18191c] border-t border-gray-700 font-semibold text-blue-400">
                  <td className="py-3 px-3 text-left border-r border-gray-700">Общее время</td>
                  {totalTrainingByMonth.map((t,i)=><td key={i} className="py-3 text-center border-r border-gray-700">{t}</td>)}
                  <td className="py-3 text-center border-l border-gray-700">{toTimeString(totalTrainingByMonth.reduce((s,t)=>s+toMinutes(t),0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

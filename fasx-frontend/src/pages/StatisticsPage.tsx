import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function StatisticsPage() {
  const [reportType, setReportType] = useState("Общий отчёт");
  const [interval, setInterval] = useState("Месяц");
  const [mode, setMode] = useState("Время");
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

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
    "Бег",
    "Лыжи классическим стилем",
    "Лыжи коньковым стилем",
    "Лыжероллеры классическим стилем",
    "Лыжероллеры коньковым стилем",
    "Силовая тренировка",
    "Велосипед",
    "Другое",
  ];

  const trainingTypeData = trainingTypes.map((type) => ({
    type,
    data: Array.from({ length: 12 }, () =>
      `${Math.floor(Math.random() * 4)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`
    ),
  }));

  const mockData = [
    { month: "Янв", I1: 30, I2: 15, I3: 10, I4: 5, I5: 2 },
    { month: "Фев", I1: 25, I2: 10, I3: 12, I4: 6, I5: 3 },
    { month: "Мар", I1: 28, I2: 12, I3: 14, I4: 7, I5: 4 },
    { month: "Апр", I1: 22, I2: 15, I3: 11, I4: 8, I5: 5 },
    { month: "Май", I1: 30, I2: 18, I3: 12, I4: 6, I5: 4 },
    { month: "Июн", I1: 27, I2: 16, I3: 13, I4: 7, I5: 3 },
    { month: "Июл", I1: 32, I2: 20, I3: 15, I4: 8, I5: 5 },
    { month: "Авг", I1: 28, I2: 18, I3: 14, I4: 6, I5: 4 },
    { month: "Сен", I1: 26, I2: 15, I3: 12, I4: 7, I5: 3 },
    { month: "Окт", I1: 30, I2: 17, I3: 13, I4: 8, I5: 4 },
    { month: "Ноя", I1: 29, I2: 16, I3: 14, I4: 6, I5: 3 },
    { month: "Дек", I1: 31, I2: 18, I3: 15, I4: 7, I5: 4 },
  ];

  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const toTimeString = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2,"0")}`;
  };

  const totalByMonth = months.map((_, monthIndex) =>
    toTimeString(enduranceData.reduce((sum, zone) => sum + toMinutes(zone.data[monthIndex]), 0))
  );
  const totalByZone = enduranceData.map((zone) =>
    toTimeString(zone.data.reduce((sum, time) => sum + toMinutes(time), 0))
  );

  const totalTrainingByMonth = months.map((_, i) =>
    toTimeString(trainingTypeData.reduce((sum, type) => sum + toMinutes(type.data[i]), 0))
  );
  const totalTrainingByType = trainingTypeData.map((t) =>
    toTimeString(t.data.reduce((sum, time) => sum + toMinutes(time), 0))
  );

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Фильтры */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#111214] p-4 rounded-2xl border border-gray-800">
            <label className="block text-sm font-semibold mb-2">Тип отчёта</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-[#0B0B0D] border border-gray-700 rounded-lg p-2 text-sm"
            >
              <option>Общий отчёт</option>
              <option>Выносливость</option>
              <option>Силовые</option>
            </select>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={mode==="Время"} onChange={()=>setMode("Время")} className="accent-blue-500"/>
                Время
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={mode==="Процент"} onChange={()=>setMode("Процент")} className="accent-blue-500"/>
                Процент
              </label>
              <span className="text-gray-500">Экспортировать статистику</span>
            </div>
          </div>

          <div className="bg-[#111214] p-4 rounded-2xl border border-gray-800">
            <label className="block text-sm font-semibold mb-2">Интервал времени</label>
            <div className="flex items-center gap-3">
              <button className="bg-[#0B0B0D] border border-gray-700 rounded-lg px-3 py-2 text-sm">{interval}</button>
              <span className="text-gray-400">— 03.09.2025</span>
            </div>
          </div>
        </div>

        {/* Диаграмма */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={mockData}
            margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
            style={{ backgroundColor: "#1a1a1d", borderRadius: 12 }}
          >
            <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#ccc" />
            <Tooltip contentStyle={{ backgroundColor: "#1a1a1d", border: "1px solid #333", color: "#fff" }} />
            <Legend formatter={(value) => value} wrapperStyle={{ color: "#fff" }} />
            <Bar dataKey="I1" stackId="a" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
            <Bar dataKey="I2" stackId="a" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
            <Bar dataKey="I3" stackId="a" fill="#facc15" radius={[6, 6, 0, 0]} barSize={32} />
            <Bar dataKey="I4" stackId="a" fill="#f97316" radius={[6, 6, 0, 0]} barSize={32} />
            <Bar dataKey="I5" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>

        {/* Параметры дня */}
        <div className="bg-[#111214] p-5 rounded-2xl border border-gray-800 animate-fadeIn">
          <h2 className="text-lg font-semibold mb-3">Параметры дня</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-800 rounded-xl overflow-hidden">
              <thead className="text-gray-400 border-b border-gray-700 bg-gradient-to-b from-[#18191c] to-[#131416]">
                <tr>
                  <th className="text-left py-2"></th>
                  <th>Май 2025</th>
                  <th>Июль 2025</th>
                  <th>Авг 2025</th>
                  <th>Сен 2025</th>
                  <th>Среднее/мес</th>
                </tr>
              </thead>
              <tbody>
                {["Болезнь","Травма","Соревнования","Высота","В поездке","Выходной"].map((row)=>(<tr key={row} className="border-b border-gray-800 hover:bg-[#1d1e22]/80 transition-colors duration-150 cursor-pointer">
                  <td className="py-2">{row}</td>
                  <td colSpan={5} className="text-center text-gray-600">—</td>
                </tr>))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Выносливость */}
        <div className="bg-[#111214] p-5 rounded-2xl border border-gray-800 animate-fadeIn">
          <h2 className="text-lg font-semibold mb-3">Выносливость</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse border border-gray-800 rounded-xl overflow-hidden">
              <thead className="text-gray-400 bg-gradient-to-b from-[#18191c] to-[#131416] shadow-sm">
                <tr>
                  <th className="text-left py-2 px-3 border-r border-gray-800">Зоны</th>
                  {months.map((m,i)=>(<th key={m} className={`py-2 px-2 text-center border-r border-gray-700/70 ${[2,5,8,11].includes(i)?"border-r-2 border-blue-500/30":""}`}>{m}</th>))}
                  <th className="py-2 px-2 text-center text-blue-400 border-l border-gray-800">Общее время</th>
                </tr>
              </thead>
              <tbody>
                {enduranceData.map(({zone,color,data},idx)=>(
                  <tr key={zone} className={`border-t border-gray-800 cursor-pointer transition-colors duration-200 ${selectedRow===zone?"bg-[#1a1b1e]/90":"hover:bg-[#1d1e22]/80"}`} onClick={()=>setSelectedRow(zone)}>
                    <td className="py-3 px-3 flex items-center gap-2 border-r border-gray-800">
                      <span className="inline-block w-3 h-3 rounded-full shadow-[0_0_6px]" style={{backgroundColor:color}}></span>
                      {zone}
                    </td>
                    {data.map((t,i)=>(<td key={i} className="py-3 text-center border-r border-gray-800">{t}</td>))}
                    <td className="py-3 text-center text-blue-400 border-l border-gray-800">{totalByZone[idx]}</td>
                  </tr>
                ))}
                <tr className="bg-[#18191c] border-t border-gray-700 font-semibold text-blue-400">
                  <td className="py-3 px-3 text-left border-r border-gray-800">Общее время</td>
                  {totalByMonth.map((t,i)=>(<td key={i} className="py-3 text-center border-r border-gray-800">{t}</td>))}
                  <td className="py-3 text-center border-l border-gray-800">{toTimeString(totalByMonth.reduce((s,t)=>s+toMinutes(t),0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Тип тренировки */}
        <div className="bg-[#111214] p-5 rounded-2xl border border-gray-800 animate-fadeIn">
          <h2 className="text-lg font-semibold mb-3">Тип тренировки</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse border border-gray-800 rounded-xl overflow-hidden">
              <thead className="text-gray-400 bg-gradient-to-b from-[#18191c] to-[#131416] shadow-sm">
                <tr>
                  <th className="text-left py-2 px-3 border-r border-gray-800">Тип тренировки</th>
                  {months.map((m,i)=>(<th key={m} className={`py-2 px-2 text-center border-r border-gray-700/70 ${[2,5,8,11].includes(i)?"border-r-2 border-blue-500/30":""}`}>{m}</th>))}
                  <th className="py-2 px-2 text-center text-blue-400 border-l border-gray-800">Общее время</th>
                </tr>
              </thead>
              <tbody>
                {trainingTypeData.map((row,idx)=>(
                  <tr key={row.type} className={`border-t border-gray-800 cursor-pointer transition-colors duration-200 ${selectedRow===row.type?"bg-[#1a1b1e]/90":"hover:bg-[#1d1e22]/80"}`} onClick={()=>setSelectedRow(row.type)}>
                    <td className="py-3 px-3 text-left border-r border-gray-800 font-medium">{row.type}</td>
                    {row.data.map((time,i)=>(<td key={i} className="py-3 text-center border-r border-gray-800">{time}</td>))}
                    <td className="py-3 text-center text-blue-400 border-l border-gray-800">{totalTrainingByType[idx]}</td>
                  </tr>
                ))}
                <tr className="bg-[#18191c] border-t border-gray-700 font-semibold text-blue-400">
                  <td className="py-3 px-3 text-left border-r border-gray-800">Общее время</td>
                  {totalTrainingByMonth.map((t,i)=>(<td key={i} className="py-3 text-center border-r border-gray-800">{t}</td>))}
                  <td className="py-3 text-center border-l border-gray-800">{toTimeString(totalTrainingByMonth.reduce((s,t)=>s+toMinutes(t),0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

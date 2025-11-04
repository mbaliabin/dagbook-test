import React from "react";

const months = [
  "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
  "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
];

const intensityZones = [
  { label: "I1", color: "#6CC070" },
  { label: "I2", color: "#9AD982" },
  { label: "I3", color: "#F8D44B" },
  { label: "I4", color: "#F89E4B" },
  { label: "I5", color: "#F85C4B" },
];

const enduranceData = {
  I1: ["1:03", "1:55", "7:26", "2:22", "4:03", "6:22", "2:10", "2:58", "5:25", "3:41", "0:13", "1:57"],
  I2: ["1:06", "1:12", "4:19", "0:54", "2:01", "5:00", "2:00", "0:54", "3:15", "2:03", "1:11", "1:36"],
  I3: ["0:38", "0:01", "0:19", "0:11", "0:19", "1:03", "0:26", "0:21", "0:47", "0:26", "0:46", "0:37"],
  I4: ["0:17", "", "0:26", "", "0:34", "0:27", "0:15", "0:44", "0:27", "", "0:35", "0:12"],
  I5: ["0:03", "", "", "", "0:13", "0:13", "0:39", "0:05", "0:04", "0:23", "0:37", "0:03"],
};

const activityForms = [
  { name: "Бег / лыжи", icon: "🏃‍♂️" },
  { name: "Лыжи (классика)", icon: "🎿" },
  { name: "Лыжи (стрельба)", icon: "🎯" },
  { name: "Роллеры", icon: "🛼" },
  { name: "Велосипед", icon: "🚴‍♂️" },
  { name: "Гребля / каяк", icon: "🚣‍♂️" },
  { name: "Другое", icon: "⚙️" },
];

const activityData = {
  "Бег / лыжи": ["1:58", "0:30", "3:00", "1:00", "1:00", "0:44", "1:50", "1:30", "3:30", "4:17", "2:30", "3:24"],
  "Лыжи (классика)": ["2:37", "1:10", "11:04", "2:02", "11:15", "4:58", "2:43", "8:50", "5:16", "2:05", "0:40", "1:55"],
  "Лыжи (стрельба)": ["", "", "", "", "", "", "1:55", "2:04", "2:43", "1:57", "1:37", "1:28"],
  "Роллеры": ["", "", "", "", "", "", "", "", "", "", "", ""],
  "Велосипед": ["", "", "", "", "", "", "", "", "", "", "", ""],
  "Гребля / каяк": ["", "", "", "", "", "", "", "", "", "", "", ""],
  "Другое": ["0:30", "", "", "1:30", "", "", "", "", "", "", "", ""],
};

export default function EnduranceAndActivityTables() {
  return (
    <div className="bg-[#0f1115] text-gray-200 p-6 rounded-2xl shadow-lg max-w-[1200px] mx-auto space-y-10">
      {/* --- Блок Выносливость --- */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Выносливость</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#1b1e24] text-gray-400">
                <th className="text-left px-3 py-2">Зона</th>
                {months.map((m) => (
                  <th key={m} className="px-2 py-2 text-center font-normal">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {intensityZones.map((zone) => (
                <tr key={zone.label} className="border-b border-[#1f2228] hover:bg-[#1a1d23]/60 transition">
                  <td className="flex items-center gap-2 px-3 py-2 font-medium">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: zone.color }}
                    />
                    {zone.label}
                  </td>
                  {enduranceData[zone.label as keyof typeof enduranceData].map((t, i) => (
                    <td key={i} className="text-center py-1">{t || "-"}</td>
                  ))}
                </tr>
              ))}
              <tr className="bg-[#1b1e24] font-semibold text-gray-300">
                <td className="px-3 py-2">Итого</td>
                {months.map((_, i) => (
                  <td key={i} className="text-center py-2">–</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Блок Формы активности --- */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Формы активности</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#1b1e24] text-gray-400">
                <th className="text-left px-3 py-2">Тип активности</th>
                {months.map((m) => (
                  <th key={m} className="px-2 py-2 text-center font-normal">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activityForms.map((a) => (
                <tr key={a.name} className="border-b border-[#1f2228] hover:bg-[#1a1d23]/60 transition">
                  <td className="px-3 py-2 flex items-center gap-2 font-medium">
                    <span>{a.icon}</span> {a.name}
                  </td>
                  {activityData[a.name as keyof typeof activityData].map((t, i) => (
                    <td key={i} className="text-center py-1">{t || "-"}</td>
                  ))}
                </tr>
              ))}
              <tr className="bg-[#1b1e24] font-semibold text-gray-300">
                <td className="px-3 py-2">Итого</td>
                {months.map((_, i) => (
                  <td key={i} className="text-center py-2">–</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Общая строка --- */}
      <div className="bg-[#1b1e24] rounded-xl text-center py-3 font-semibold text-gray-300">
        Общий объём тренировок: <span className="text-white">–</span>
      </div>
    </div>
  );
}

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-[#1a1a1a]/90 border border-gray-700 rounded-lg px-3 py-2 shadow-md text-sm text-gray-200">
        <p className="font-semibold mb-1">{label}</p>
        <p>
          {item.name}
          <span className="ml-1">
            {unit === "км"
              ? `${item.value} км`
              : `${Math.floor(item.value / 60)} ч ${item.value % 60} м`}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const DurationChart = ({ data, dataKey, color, unit }) => (
  <div className="w-full h-72 bg-[#0f0f0f] rounded-2xl p-4 shadow-lg border border-gray-800">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        barSize={45}
        margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="type" tick={{ fill: "#aaa", fontSize: 12 }} />
        <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ fill: "transparent" }} />
        <Legend wrapperStyle={{ color: "#ccc" }} />
        <Bar dataKey={dataKey} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const EnduranceTable = ({ data }) => (
  <div className="bg-[#0f0f0f] rounded-2xl p-4 shadow-lg border border-gray-800 text-gray-200">
    <h3 className="text-lg font-semibold mb-4">Зоны выносливости</h3>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-gray-400 text-left border-b border-gray-700">
          <th className="py-2">Зона</th>
          <th className="py-2">Время</th>
        </tr>
      </thead>
      <tbody>
        {data.map((zone, index) => (
          <tr
            key={index}
            className="hover:bg-[#1c1c1c] transition-colors duration-150"
          >
            <td className="py-2 flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full`}
                style={{
                  backgroundColor:
                    zone.zone === "I1"
                      ? "#4FC3F7"
                      : zone.zone === "I2"
                      ? "#0288D1"
                      : zone.zone === "I3"
                      ? "#FFD54F"
                      : zone.zone === "I4"
                      ? "#FB8C00"
                      : "#E53935",
                }}
              ></span>
              {zone.zone}
            </td>
            <td className="py-2 text-gray-300">{zone.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const DurationTable = ({ data }) => (
  <div className="bg-[#0f0f0f] rounded-2xl p-4 shadow-lg border border-gray-800 text-gray-200">
    <h3 className="text-lg font-semibold mb-4">Длительность по видам тренировок</h3>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-gray-400 text-left border-b border-gray-700">
          <th className="py-2">Тип тренировки</th>
          <th className="py-2">Время</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr
            key={index}
            className="hover:bg-[#1c1c1c] transition-colors duration-150"
          >
            <td className="py-2">{item.type}</td>
            <td className="py-2 text-gray-300">{item.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const DistanceTable = ({ data }) => (
  <div className="bg-[#0f0f0f] rounded-2xl p-4 shadow-lg border border-gray-800 text-gray-200">
    <h3 className="text-lg font-semibold mb-4">Общее расстояние</h3>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-gray-400 text-left border-b border-gray-700">
          <th className="py-2">Тип тренировки</th>
          <th className="py-2">Расстояние (км)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr
            key={index}
            className="hover:bg-[#1c1c1c] transition-colors duration-150"
          >
            <td className="py-2">{item.type}</td>
            <td className="py-2 text-gray-300">{item.distance}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const StatsPage = () => {
  const durationData = [
    { type: "Бег", value: 75 },
    { type: "Велосипед", value: 130 },
    { type: "Плавание", value: 45 },
    { type: "Силовая тренировка", value: 60 },
  ];

  const distanceData = [
    { type: "Бег", value: 14.2 },
    { type: "Велосипед", value: 37.5 },
    { type: "Плавание", value: 2.3 },
  ];

  const enduranceData = [
    { zone: "I1", time: "0:30" },
    { zone: "I2", time: "0:45" },
    { zone: "I3", time: "1:10" },
    { zone: "I4", time: "0:35" },
    { zone: "I5", time: "0:20" },
  ];

  const durationTableData = [
    { type: "Бег", time: "1:15" },
    { type: "Велосипед", time: "2:10" },
    { type: "Плавание", time: "0:45" },
    { type: "Силовая тренировка", time: "1:00" },
  ];

  const distanceTableData = [
    { type: "Бег", distance: 14.2 },
    { type: "Велосипед", distance: 37.5 },
    { type: "Плавание", distance: 2.3 },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-100">Отчёты</h1>

      {/* Диаграмма длительности */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Длительность</h2>
        <DurationChart data={durationData} dataKey="value" color="#4FC3F7" unit="время" />
      </div>

      {/* Диаграмма расстояния */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Общее расстояние</h2>
        <DurationChart data={distanceData} dataKey="value" color="#81C784" unit="км" />
      </div>

      {/* Таблицы */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnduranceTable data={enduranceData} />
        <DurationTable data={durationTableData} />
        <DistanceTable data={distanceTableData} />
      </div>
    </div>
  );
};

export default StatsPage;

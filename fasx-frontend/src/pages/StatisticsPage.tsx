{/* Основная таблица отчета */}
<div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md mb-6">
  <h2 className="text-lg font-semibold mb-3">
    {reportType === "Выносливость"
      ? "Зоны выносливости (мин)"
      : `Тип тренировки (${reportType === "Общее расстояние" ? "км" : "мин"})`}
  </h2>
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-gray-300 border-collapse border border-gray-800 rounded-xl overflow-hidden">
      <thead className="text-gray-400 bg-gradient-to-b from-[#18191c] to-[#131416]">
        <tr>
          <th className="text-left py-2 px-3 border-r border-gray-800">
            {reportType === "Выносливость" ? "Зона" : "Тип тренировки"}
          </th>
          {months.map((m) => (
            <th key={m} className="py-2 px-2 text-center border-r border-gray-700/70">{m}</th>
          ))}
          <th className="py-2 px-2 text-center text-blue-400 border-l border-gray-800">Общее</th>
        </tr>
      </thead>
      <tbody>
        {(reportType === "Выносливость" ? enduranceZones : trainingTypes).map((type) => (
          <tr key={type} className="border-b border-gray-800">
            <td className="py-2 px-3 border-r border-gray-800">{type}</td>
            {chartData.map((d, i) => (
              <td key={i} className="text-center">{d[type]}</td>
            ))}
            <td className="text-center text-blue-400">
              {chartData.reduce((sum, d) => sum + d[type], 0)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

{/* Таблица Параметры дня */}
<div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md mb-10">
  <h2 className="text-lg font-semibold mb-3">Параметры дня</h2>
  <div className="overflow-x-auto">
    <table className="w-full text-sm border-collapse border border-gray-800 rounded-xl overflow-hidden">
      <thead className="text-gray-400 border-b border-gray-700 bg-gradient-to-b from-[#18191c] to-[#131416]">
        <tr>
          <th className="text-left py-2"></th>
          {["Май 2025","Июль 2025","Авг 2025","Сен 2025","Среднее/мес"].map((m)=>(<th key={m}>{m}</th>))}
        </tr>
      </thead>
      <tbody>
        {[
          { row: "Болезнь", values: ["—","—","—","—","—"] },
          { row: "Травма", values: ["—","—","—","—","—"] },
          { row: "Соревнования", values: ["✓","—","✓","—","—"] },
          { row: "Высота", values: ["—","—","—","✓","—"] },
          { row: "В поездке", values: ["—","✓","—","—","—"] },
          { row: "Выходной", values: ["—","—","✓","—","✓"] },
        ].map((item) => (
          <tr key={item.row} className="border-b border-gray-800 hover:bg-[#1d1e22]/80 transition-colors duration-150">
            <td className="py-2">{item.row}</td>
            {item.values.map((v,i)=><td key={i} className="text-center text-gray-400">{v}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

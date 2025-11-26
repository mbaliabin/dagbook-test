{/* Диаграмма зон выносливости */}
<div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
  <h2 className="text-lg font-semibold mb-4 text-gray-100">Зоны выносливости</h2>
  <div className="h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={filteredMonths.map((month, i) => {
          const data: any = { month };
          filteredEnduranceZones.forEach((zone) => {
            data[zone.zone] = zone.months[i] ?? 0;
          });
          return data;
        })}
        barGap={0}               // убираем промежутки между столбцами
        barCategoryGap="0%"      // убираем промежутки между категориями
      >
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#888", fontSize: 12 }}
        />

        <Tooltip
          content={({ active, payload }: any) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-[#1e1e1e] border border-[#333] px-3 py-2 rounded-xl text-sm text-white">
                  {payload.map((p: any) => (
                    <div key={p.dataKey} className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: p.fill }}
                      ></span>
                      {p.dataKey}: {p.value} мин
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          }}
        />

        {filteredEnduranceZones.map((zone) => (
          <Bar
            key={zone.zone}
            dataKey={zone.zone}
            stackId="a"
            fill={zone.color}
            // Динамически растягиваем ширину: чем меньше элементов — тем шире столбцы
            maxBarSize={Math.floor(800 / filteredMonths.length)}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

            <TableSection
              table={{
                title: "Тип активности",
                data: filteredMovementTypes.map((m) => ({
                  type: m.type,
                  months: m.months,
                  total: m.total,
                  color: m.color,
                })),
              }}
              index={2}
            />

            {/* Диаграмма Выносливости */}
            <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg mt-6">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Диаграмма выносливости</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={filteredMonths.map((m, idx) => {
                    const entry: any = { month: m };
                    filteredEnduranceZones.forEach((z) => {
                      entry[z.zone] = z.months[idx] || 0;
                    });
                    return entry;
                  })}
                >
                  <XAxis dataKey="month" stroke="#888" />
                  <Tooltip />
                  {filteredEnduranceZones.map((z) => (
                    <Bar key={z.zone} dataKey={z.zone} stackId="a" fill={z.color} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {reportType === "Общая дистанция" && (
          <>
            <TableSection
              table={{
                title: "Общая дистанция",
                data: filteredDistanceTypes.map((d) => ({
                  type: d.type,
                  months: d.months,
                  total: d.total,
                  color: d.color,
                })),
              }}
              index={3}
            />

            {/* Диаграмма дистанции */}
            <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg mt-6">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Диаграмма дистанции по видам</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={filteredMonths.map((m, idx) => {
                    const entry: any = { month: m };
                    filteredDistanceTypes.forEach((d) => {
                      entry[d.type] = d.months[idx] || 0;
                    });
                    return entry;
                  })}
                >
                  <XAxis dataKey="month" stroke="#888" />
                  <Tooltip />
                  {filteredDistanceTypes.map((d) => (
                    <Bar key={d.type} dataKey={d.type} stackId="a" fill={d.color} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

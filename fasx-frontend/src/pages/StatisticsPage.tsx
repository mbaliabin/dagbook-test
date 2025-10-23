import React from "react";

const enduranceData = [
  { month: "Январь", зона1: 5, зона2: 3, зона3: 2 },
  { month: "Февраль", зона1: 6, зона2: 4, зона3: 3 },
  { month: "Март", зона1: 7, зона2: 5, зона3: 2 },
  { month: "Апрель", зона1: 8, зона2: 6, зона3: 4 },
  { month: "Май", зона1: 6, зона2: 4, зона3: 3 },
  { month: "Июнь", зона1: 7, зона2: 5, зона3: 2 },
  { month: "Июль", зона1: 5, зона2: 3, зона3: 2 },
  { month: "Август", зона1: 4, зона2: 2, зона3: 1 },
  { month: "Сентябрь", зона1: 6, зона2: 3, зона3: 2 },
  { month: "Октябрь", зона1: 7, зона2: 5, зона3: 3 },
  { month: "Ноябрь", зона1: 5, зона2: 4, зона3: 3 },
  { month: "Декабрь", зона1: 6, зона2: 3, зона3: 2 },
];

// Данные для таблицы "Тип тренировки"
const workoutTypes = [
  "Бег",
  "Лыжи классическим стилем",
  "Лыжи коньковым стилем",
  "Лыжероллеры классическим стилем",
  "Лыжероллеры коньковым стилем",
  "Силовая тренировка",
  "Велосипед",
  "Другое",
];

const months = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const mockWorkoutTypeData: Record<string, Record<string, number>> = {};
workoutTypes.forEach((type) => {
  mockWorkoutTypeData[type] = {};
  months.forEach((month) => {
    mockWorkoutTypeData[type][month] = Math.floor(Math.random() * 10) + 1; // рандомные часы
  });
});

const TrainingStatsPage: React.FC = () => {
  // Вычисляем totals
  const enduranceTotals = {
    зона1: enduranceData.reduce((acc, m) => acc + m.зона1, 0),
    зона2: enduranceData.reduce((acc, m) => acc + m.зона2, 0),
    зона3: enduranceData.reduce((acc, m) => acc + m.зона3, 0),
  };

  const totalByType: Record<string, number> = {};
  workoutTypes.forEach((type) => {
    totalByType[type] = Object.values(mockWorkoutTypeData[type]).reduce(
      (acc, val) => acc + val,
      0
    );
  });

  const totalByMonth: Record<string, number> = {};
  months.forEach((month) => {
    totalByMonth[month] = workoutTypes.reduce(
      (acc, type) => acc + mockWorkoutTypeData[type][month],
      0
    );
  });

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white space-y-12">
      {/* 1. Таблица состояния */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Состояние</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-2 text-left">Параметр</th>
                <th className="p-2 text-right">Значение</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-700">
                <td className="p-2">Пульс покоя</td>
                <td className="p-2 text-right">52</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2">Вес</td>
                <td className="p-2 text-right">74 кг</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2">VO₂ Max</td>
                <td className="p-2 text-right">57</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Таблица выносливости */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Выносливость</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-2 text-left">Месяц</th>
                <th className="p-2 text-right">Зона 1</th>
                <th className="p-2 text-right">Зона 2</th>
                <th className="p-2 text-right">Зона 3</th>
                <th className="p-2 text-right">Общее время</th>
              </tr>
            </thead>
            <tbody>
              {enduranceData.map((item, idx) => {
                const total = item.зона1 + item.зона2 + item.зона3;
                return (
                  <tr key={idx} className="border-t border-gray-700">
                    <td className="p-2">{item.month}</td>
                    <td className="p-2 text-right">{item.зона1}</td>
                    <td className="p-2 text-right">{item.зона2}</td>
                    <td className="p-2 text-right">{item.зона3}</td>
                    <td className="p-2 text-right">{total}</td>
                  </tr>
                );
              })}
              <tr className="border-t border-gray-700 font-semibold bg-gray-800">
                <td className="p-2">Итого</td>
                <td className="p-2 text-right">{enduranceTotals.зона1}</td>
                <td className="p-2 text-right">{enduranceTotals.зона2}</td>
                <td className="p-2 text-right">{enduranceTotals.зона3}</td>
                <td className="p-2 text-right">
                  {enduranceTotals.зона1 +
                    enduranceTotals.зона2 +
                    enduranceTotals.зона3}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Таблица тип тренировки */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Тип тренировки</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-2 text-left">Тип тренировки</th>
                {months.map((m) => (
                  <th key={m} className="p-2 text-right">
                    {m}
                  </th>
                ))}
                <th className="p-2 text-right">Общее время</th>
              </tr>
            </thead>
            <tbody>
              {workoutTypes.map((type) => (
                <tr key={type} className="border-t border-gray-700">
                  <td className="p-2">{type}</td>
                  {months.map((m) => (
                    <td key={m} className="p-2 text-right">
                      {mockWorkoutTypeData[type][m]}
                    </td>
                  ))}
                  <td className="p-2 text-right font-semibold">
                    {totalByType[type]}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-gray-700 font-semibold bg-gray-800">
                <td className="p-2">Итого по месяцам</td>
                {months.map((m) => (
                  <td key={m} className="p-2 text-right">
                    {totalByMonth[m]}
                  </td>
                ))}
                <td className="p-2 text-right">
                  {Object.values(totalByType).reduce((a, b) => a + b, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrainingStatsPage;

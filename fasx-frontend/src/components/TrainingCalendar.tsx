import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import { ru } from "date-fns/locale";

export default function TrainingCalendar() {
  const [currentDate] = useState(new Date());

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });

  const offset = (getDay(start) + 6) % 7;
  const paddedDays = Array(offset).fill(null).concat(days);

  return (
    <div className="w-full max-w-5xl mx-auto bg-zinc-900 p-4 rounded-2xl shadow-xl overflow-hidden">
      <h2 className="text-xl font-semibold mb-4 text-white text-center">
        Календарь тренировок — {format(currentDate, "LLLL yyyy", { locale: ru })}
      </h2>

      {/* Дни недели */}
      <div className="grid grid-cols-7 text-center text-xs text-zinc-400 mb-2">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Ячейки дней */}
      <div className="grid grid-cols-7 gap-1 text-sm">
        {paddedDays.map((day, idx) =>
          day ? (
            <div
              key={day.toISOString()}
              className="h-24 flex items-start justify-start rounded-md bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1"
            >
              <span className="text-xs font-semibold">{format(day, "d", { locale: ru })}</span>
            </div>
          ) : (
            <div key={`empty-${idx}`} className="h-24" />
          )
        )}
      </div>
    </div>
  );
}


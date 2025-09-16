import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRange: (range: { startDate: Date; endDate: Date }) => void;
}

const CalendarModalMobile: React.FC<CalendarModalProps> = ({ isOpen, onClose, onSelectRange }) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  if (!isOpen) return null;

  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const startDay = startOfMonth.day() === 0 ? 7 : startOfMonth.day();
  const daysInMonth = endOfMonth.date();

  const weeks: (number | null)[][] = [];
  let day = 1 - (startDay - 1);
  while (day <= daysInMonth) {
    const week: (number | null)[] = [];
    for (let i = 0; i < 7; i++) {
      if (day > 0 && day <= daysInMonth) week.push(day);
      else week.push(null);
      day++;
    }
    weeks.push(week);
  }

  const changeMonth = (diff: number) => setCurrentDate(currentDate.add(diff, "month"));

  const handleClickDay = (d: number | null) => {
    if (!d) return;
    const clickedDate = currentDate.date(d);
    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (clickedDate.isBefore(startDate)) {
      setEndDate(startDate);
      setStartDate(clickedDate);
    } else {
      setEndDate(clickedDate);
    }
  };

  const applyRange = () => {
    if (startDate && endDate) {
      onSelectRange({ startDate: startDate.toDate(), endDate: endDate.toDate() });
      onClose();
    }
  };

  const isInRange = (d: number) => {
    if (!startDate || !endDate) return false;
    const dateObj = currentDate.date(d);
    return dateObj.isAfter(startDate) && dateObj.isBefore(endDate);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="w-80 bg-[#1c1c1e] text-gray-200 rounded-2xl shadow-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => changeMonth(-1)} className="px-2 py-1 rounded-md hover:bg-gray-700 text-gray-300">◀</button>
          <div className="flex items-center space-x-2 font-semibold text-white">
            <span className="capitalize">{currentDate.format("MMMM")}</span>
            <span>{currentDate.format("YYYY")}</span>
          </div>
          <button onClick={() => changeMonth(1)} className="px-2 py-1 rounded-md hover:bg-gray-700 text-gray-300">▶</button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 text-center text-sm text-gray-400 mb-2">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(d => <div key={d}>{d}</div>)}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-7 gap-1">
          {weeks.map((week, wi) =>
            week.map((d, di) => {
              const dateObj = d ? currentDate.date(d) : null;
              const isStart = dateObj && startDate && dateObj.isSame(startDate, "day");
              const isEnd = dateObj && endDate && dateObj.isSame(endDate, "day");
              const inRange = d && isInRange(d);

              return (
                <div
                  key={`${wi}-${di}`}
                  className={`h-10 flex items-center justify-center rounded-lg cursor-pointer transition
                    ${!d ? "opacity-30" : ""}
                    ${isStart || isEnd ? "bg-blue-600 text-white" : ""}
                    ${inRange ? "bg-blue-400 text-white" : ""}
                    ${!isStart && !isEnd && !inRange && d ? "hover:bg-gray-700" : ""}
                  `}
                  onClick={() => handleClickDay(d)}
                >
                  {d}
                </div>
              );
            })
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-2 space-x-2">
          <button onClick={onClose} className="px-3 py-1 rounded border border-gray-600 hover:bg-gray-700 text-gray-300">
            Отмена
          </button>
          <button
            onClick={applyRange}
            className={`px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white ${!startDate || !endDate ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!startDate || !endDate}
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarModalMobile;

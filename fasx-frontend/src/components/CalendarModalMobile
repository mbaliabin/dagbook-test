import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";

interface CalendarModalMobileProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: Date, endDate: Date) => void;
}

const CalendarModalMobile: React.FC<CalendarModalMobileProps> = ({ isOpen, onClose, onApply }) => {
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
      if (day > 0 && day <= daysInMonth) {
        week.push(day);
      } else {
        week.push(null);
      }
      day++;
    }
    weeks.push(week);
  }

  const changeMonth = (diff: number) => setCurrentDate(currentDate.add(diff, "month"));

  const handleSelectDate = (day: number | null) => {
    if (!day) return;
    const selected = currentDate.date(day);
    if (!startDate || (startDate && endDate)) {
      setStartDate(selected);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (selected.isBefore(startDate)) {
        setEndDate(startDate);
        setStartDate(selected);
      } else {
        setEndDate(selected);
      }
    }
  };

  const isInRange = (day: number | null) => {
    if (!day) return false;
    if (startDate && endDate) {
      const dateObj = currentDate.date(day);
      return dateObj.isBetween(startDate, endDate, "day", "[]");
    }
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
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
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div>Сб</div>
          <div>Вс</div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-7 gap-1">
          {weeks.map((week, wi) =>
            week.map((d, di) => {
              if (!d) return <div key={`${wi}-${di}`} className="h-10"></div>;
              const dateObj = currentDate.date(d);
              const isSelected = startDate && dateObj.isSame(startDate, "day") || endDate && dateObj.isSame(endDate, "day");
              const isRange = isInRange(d);
              const isToday = dateObj.isSame(dayjs(), "day");

              return (
                <div
                  key={`${wi}-${di}`}
                  className={`h-10 flex items-center justify-center rounded-lg cursor-pointer transition
                    ${isSelected ? "bg-blue-600 text-white" : ""}
                    ${isRange && !isSelected ? "bg-blue-400/50" : ""}
                    ${isToday && !isSelected ? "border border-blue-500" : ""}
                    hover:bg-gray-700
                  `}
                  onClick={() => handleSelectDate(d)}
                >
                  {d}
                </div>
              );
            })
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white">Отмена</button>
          <button
            onClick={() => {
              if (startDate && endDate) {
                onApply(startDate.toDate(), endDate.toDate());
                onClose();
              } else {
                alert("Выберите диапазон дат");
              }
            }}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarModalMobile;


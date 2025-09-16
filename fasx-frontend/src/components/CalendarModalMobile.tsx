import React, { useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarModalMobileProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
}

const CalendarModalMobile: React.FC<CalendarModalMobileProps> = ({
  isOpen,
  onClose,
  onSelectDate,
}) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());

  if (!isOpen) return null;

  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const startDay = startOfMonth.day() === 0 ? 7 : startOfMonth.day(); // Пн = 1
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

  const handleSelectDate = (day: number | null) => {
    if (!day) return;
    const newDate = currentDate.date(day);
    setSelectedDate(newDate);
    onSelectDate(newDate.toDate());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-80 bg-[#1c1c1e] text-gray-200 rounded-2xl shadow-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-md hover:bg-gray-700 text-gray-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2 font-semibold text-white">
            <span className="capitalize">{currentDate.format("MMMM")}</span>
            <span>{currentDate.format("YYYY")}</span>
          </div>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 rounded-md hover:bg-gray-700 text-gray-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
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
              const dateObj = d ? currentDate.date(d) : null;
              const isSelected = dateObj && dateObj.isSame(selectedDate, "day");
              const isToday = dateObj && dateObj.isSame(dayjs(), "day");

              return (
                <div
                  key={`${wi}-${di}`}
                  className={`h-10 flex items-center justify-center rounded-lg cursor-pointer transition
                    ${!d ? "opacity-30" : ""}
                    ${isSelected ? "bg-blue-600 text-white" : ""}
                    ${isToday && !isSelected ? "border border-blue-500" : ""}
                    ${!isSelected && !isToday && d ? "hover:bg-gray-700" : ""}
                  `}
                  onClick={() => handleSelectDate(d)}
                >
                  {d}
                </div>
              );
            })
          )}
        </div>

        {/* Close button */}
        <div className="flex justify-end mt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarModalMobile;

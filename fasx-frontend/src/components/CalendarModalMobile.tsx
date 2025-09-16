import React, { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";

interface CalendarModalMobileProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRange: (range: { startDate: Date; endDate: Date }) => void;
  initialRange?: { startDate: Date; endDate: Date };
}

const CalendarModalMobile: React.FC<CalendarModalMobileProps> = ({
  isOpen,
  onClose,
  onSelectRange,
  initialRange,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [startDate, setStartDate] = useState<Dayjs | null>(initialRange ? dayjs(initialRange.startDate) : null);
  const [endDate, setEndDate] = useState<Dayjs | null>(initialRange ? dayjs(initialRange.endDate) : null);

  useEffect(() => {
    if (initialRange) {
      setStartDate(dayjs(initialRange.startDate));
      setEndDate(dayjs(initialRange.endDate));
      setCurrentMonth(dayjs(initialRange.startDate));
    }
  }, [initialRange]);

  if (!isOpen) return null;

  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");
  const startDay = startOfMonth.day() === 0 ? 7 : startOfMonth.day(); // Пн = 1
  const daysInMonth = endOfMonth.date();

  const weeks: (number | null)[][] = [];
  let dayCounter = 1 - (startDay - 1);

  while (dayCounter <= daysInMonth) {
    const week: (number | null)[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(dayCounter > 0 && dayCounter <= daysInMonth ? dayCounter : null);
      dayCounter++;
    }
    weeks.push(week);
  }

  const handleDayClick = (d: number | null) => {
    if (!d) return;
    const clickedDate = currentMonth.date(d);

    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (clickedDate.isBefore(startDate)) {
        setEndDate(startDate);
        setStartDate(clickedDate);
      } else {
        setEndDate(clickedDate);
      }
    }
  };

  const applyRange = () => {
    if (startDate && endDate) {
      onSelectRange({ startDate: startDate.toDate(), endDate: endDate.toDate() });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1c1e] text-gray-200 rounded-2xl shadow-lg p-4 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
            className="px-2 py-1 rounded-md hover:bg-gray-700 text-gray-300"
          >
            ◀
          </button>
          <div className="flex items-center space-x-2 font-semibold text-white">
            <span className="capitalize">{currentMonth.format("MMMM")}</span>
            <span>{currentMonth.format("YYYY")}</span>
          </div>
          <button
            onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
            className="px-2 py-1 rounded-md hover:bg-gray-700 text-gray-300"
          >
            ▶
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
              const dateObj = d ? currentMonth.date(d) : null;
              const isSelected =
                dateObj &&
                ((startDate && dateObj.isSame(startDate, "day")) ||
                  (endDate && dateObj.isSame(endDate, "day")) ||
                  (startDate && endDate && dateObj.isAfter(startDate) && dateObj.isBefore(endDate)));
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
                  onClick={() => handleDayClick(d)}
                >
                  {d}
                </div>
              );
            })
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded border border-gray-600 hover:bg-gray-700 text-gray-300"
          >
            Отмена
          </button>
          <button
            onClick={applyRange}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
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

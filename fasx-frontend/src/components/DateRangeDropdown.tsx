import React, { useState } from 'react'

interface DateRangeDropdownProps {
  initialStartDate: string
  initialEndDate: string
  onApply: (start: string, end: string) => void
  onCancel: () => void
}

export default function DateRangeDropdown({
  initialStartDate,
  initialEndDate,
  onApply,
  onCancel,
}: DateRangeDropdownProps) {
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)

  return (
    <div className="absolute z-10 mt-2 p-4 bg-[#1a1a1d] rounded-xl shadow-lg w-72 text-white">
      <div className="flex flex-col space-y-4">
        <div>
          <label className="block text-xs mb-1" htmlFor="start-date">
            Начало периода
          </label>
          <input
            type="date"
            id="start-date"
            className="w-full p-2 rounded bg-[#2a2a2d] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            max={endDate}
          />
        </div>
        <div>
          <label className="block text-xs mb-1" htmlFor="end-date">
            Конец периода
          </label>
          <input
            type="date"
            id="end-date"
            className="w-full p-2 rounded bg-[#2a2a2d] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            min={startDate}
            max={new Date().toISOString().slice(0, 10)} // не позже сегодня
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 transition"
          >
            Отмена
          </button>
          <button
            onClick={() => onApply(startDate, endDate)}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition"
            disabled={!startDate || !endDate || startDate > endDate}
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  )
}


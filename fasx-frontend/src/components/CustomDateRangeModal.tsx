import React, { useState } from "react";
import { Dialog } from "@headlessui/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (start: string, end: string) => void;
}

export default function CustomDateRangeModal({ isOpen, onClose, onApply }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const handleApply = () => {
    if (new Date(startDate) > new Date(endDate)) {
      alert("Дата начала не может быть позже даты окончания");
      return;
    }
    onApply(startDate, endDate);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-[#1a1a1d] p-6 rounded-xl w-[300px] space-y-4 text-white shadow-xl">
          <Dialog.Title className="text-lg font-semibold">Выбор периода</Dialog.Title>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">С</label>
            <input
              type="date"
              className="w-full bg-[#2a2a2d] text-white px-3 py-2 rounded-md outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">По</label>
            <input
              type="date"
              className="w-full bg-[#2a2a2d] text-white px-3 py-2 rounded-md outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-700 text-sm text-white rounded hover:bg-gray-600"
            >
              Отмена
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1 bg-blue-600 text-sm text-white rounded hover:bg-blue-500"
            >
              Применить
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}


// Теперь у меня есть колонка Weekly Session туда нужно выгрузить все данные из моей БД, код колонки ниже
import React from "react";
import { Calendar, Bike, Footprints, Dumbbell } from "lucide-react";

const sessions = [
  { day: "Mon", type: "Bike", duration: "45 min", zone: "Zone 2" },
  { day: "Tue", type: "Run", duration: "30 min", zone: "Zone 3" },
  { day: "Wed", type: "Strength", duration: "1h", zone: "Zone 4" },
  { day: "Thu", type: "Rest" },
  { day: "Fri", type: "Run", duration: "20 min", zone: "Zone 2" },
  { day: "Sat", type: "Bike", duration: "1h", zone: "Zone 1" },
  { day: "Sun", type: "Rest" },
];

export default function WeeklySessions() {
  return (
    <div className="bg-[#1a1a1d] p-4 rounded-xl text-white space-y-3">
      <h2 className="text-lg font-semibold">Weekly Sessions</h2>
      <ul className="space-y-2">
        {sessions.map((session, idx) => (
          <li key={idx} className="flex items-center justify-between text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="w-12">{session.day}</span>
              {session.type !== "Rest" ? (
                <>
                  {session.type === "Bike" && <Bike className="w-4 h-4 text-orange-400" />}
                  {session.type === "Run" && <Footprints className="w-4 h-4 text-green-400" />}
                  {session.type === "Strength" && <Dumbbell className="w-4 h-4 text-purple-400" />}
                  <span>{session.duration}</span>
                  <span className="text-gray-500 ml-2">{session.zone}</span>
                </>
              ) : (
                <span className="text-gray-500">Rest</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

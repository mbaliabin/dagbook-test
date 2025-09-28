import { useState } from "react";
import { Home, BarChart3, ClipboardList, CalendarDays } from "lucide-react";

export default function DailyParameters() {
  const [physical, setPhysical] = useState(0);
  const [mental, setMental] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(0);
  const [pulse, setPulse] = useState("");
  const [sleepDuration, setSleepDuration] = useState("");
  const [comment, setComment] = useState("");

  // Динамическая дата
  const today = new Date().toLocaleDateString("no-NO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  const handleSave = () => {
    const data = {
      physical,
      mental,
      sleepQuality,
      pulse,
      sleepDuration,
      comment,
    };
    console.log("Lagret data:", data);
    alert("Data lagret! ✅"); // можно заменить на API вызов
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Навигация */}
      <div className="flex justify-around items-center border-b border-gray-700 pb-2 mb-4">
        <div className="flex flex-col items-center text-blue-400">
          <Home size={22} />
          <span className="text-xs">Hjem</span>
        </div>
        <div className="flex flex-col items-center">
          <BarChart3 size={22} />
          <span className="text-xs">Trening</span>
        </div>
        <div className="flex flex-col items-center">
          <ClipboardList size={22} />
          <span className="text-xs">Planlegg</span>
        </div>
        <div className="flex flex-col items-center">
          <CalendarDays size={22} />
          <span className="text-xs">Statistikk</span>
        </div>
      </div>

      {/* Карточка параметров */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg">
        <div className="p-4 space-y-6">
          <h2 className="text-xl font-semibold text-blue-400">
            Dagsparametere
          </h2>
          <p className="text-gray-400 capitalize">{today}</p>

          {/* Физическая готовность */}
          <div>
            <p className="mb-2">Fysisk klar</p>
            <div className="flex space-x-2">
              {[...Array(7)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhysical(i + 1)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition
                    ${i < physical ? "bg-blue-500 scale-110" : "bg-gray-700"}`}
                >
                  💪
                </button>
              ))}
            </div>
          </div>

          {/* Ментальная готовность */}
          <div>
            <p className="mb-2">Mentalt klar</p>
            <div className="flex space-x-2">
              {[...Array(7)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setMental(i + 1)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition
                    ${i < mental ? "bg-blue-500 scale-110" : "bg-gray-700"}`}
                >
                  🧠
                </button>
              ))}
            </div>
          </div>

          {/* Пульс */}
          <div>
            <p className="mb-2">Hvilepuls</p>
            <input
              type="number"
              value={pulse}
              onChange={(e) => setPulse(e.target.value)}
              placeholder="slag/min"
              className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
            />
          </div>

          {/* Сон */}
          <div>
            <p className="mb-2">Søvnkvalitet</p>
            <div className="flex space-x-2">
              {[...Array(7)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSleepQuality(i + 1)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition
                    ${i < sleepQuality ? "bg-blue-500 scale-110" : "bg-gray-700"}`}
                >
                  🌙
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2">Søvnlenge (timer:minutter)</p>
            <input
              type="text"
              value={sleepDuration}
              onChange={(e) => setSleepDuration(e.target.value)}
              placeholder="f.eks. 07:30"
              className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
            />
          </div>

          {/* Комментарий */}
          <div>
            <p className="mb-2">Kommentarer til dagen</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Skriv her..."
              className="w-full p-2 h-24 rounded-lg bg-gray-800 border border-gray-700 text-white"
            />
          </div>

          {/* Кнопка сохранить */}
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl"
          >
            Lagre
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import dayjs from "dayjs";

const API_URL = "http://46.173.18.36:4000";

const DailyParametersMobile: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [mainParam, setMainParam] = useState<string | null>(null);
  const [physical, setPhysical] = useState<number>(0);
  const [mental, setMental] = useState<number>(0);
  const [sleepQuality, setSleepQuality] = useState<number>(0);
  const [pulse, setPulse] = useState<string>("");
  const [sleepDuration, setSleepDuration] = useState<string>("");
  const [comment, setComment] = useState<string>("");

  // Загрузка данных
  const fetchDailyInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const dateStr = selectedDate.format("YYYY-MM-DD");

      const response = await fetch(
        `${API_URL}/api/daily-information?date=${dateStr}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 404) {
        // Нет данных — сбрасываем поля и выходим без ошибок
        setMainParam(null);
        setPhysical(0);
        setMental(0);
        setSleepQuality(0);
        setPulse("");
        setSleepDuration("");
        setComment("");
        return;
      }

      if (!response.ok) {
        throw new Error("Ошибка загрузки данных");
      }

      const data = await response.json();
      setMainParam(data.main_param || null);
      setPhysical(Number(data.physical) || 0);
      setMental(Number(data.mental) || 0);
      setSleepQuality(Number(data.sleep_quality) || 0);
      setPulse(data.pulse != null ? String(data.pulse) : "");
      setSleepDuration(data.sleep_duration || "");
      setComment(data.comment || "");
    } catch (err) {
      console.error("Ошибка загрузки данных дня:", err);
    }
  };

  // Сохранение данных
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const dateStr = selectedDate.format("YYYY-MM-DD");

      const payload = {
        date: dateStr,
        main_param: mainParam,
        physical,
        mental,
        sleep_quality: sleepQuality,
        pulse: pulse ? Number(pulse) : null,
        sleep_duration: sleepDuration,
        comment,
      };

      console.log("Отправка данных:", payload);

      const response = await fetch(`${API_URL}/api/daily-information`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Ошибка сохранения");
      }

      const data = await response.json();
      console.log("Сохранено:", data);
    } catch (err) {
      console.error("Ошибка сохранения:", err);
    }
  };

  useEffect(() => {
    fetchDailyInfo();
  }, [selectedDate]);

  return (
    <div className="p-4 text-white bg-gray-900">
      <h2 className="text-lg font-bold mb-2">
        Параметры за {selectedDate.format("DD.MM.YYYY")}
      </h2>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Главный параметр"
          value={mainParam || ""}
          onChange={(e) => setMainParam(e.target.value)}
          className="w-full p-2 rounded bg-gray-800"
        />
        <input
          type="number"
          placeholder="Физическое состояние"
          value={physical}
          onChange={(e) => setPhysical(Number(e.target.value))}
          className="w-full p-2 rounded bg-gray-800"
        />
        <input
          type="number"
          placeholder="Ментальное состояние"
          value={mental}
          onChange={(e) => setMental(Number(e.target.value))}
          className="w-full p-2 rounded bg-gray-800"
        />
        <input
          type="number"
          placeholder="Качество сна"
          value={sleepQuality}
          onChange={(e) => setSleepQuality(Number(e.target.value))}
          className="w-full p-2 rounded bg-gray-800"
        />
        <input
          type="number"
          placeholder="Пульс"
          value={pulse}
          onChange={(e) => setPulse(e.target.value)}
          className="w-full p-2 rounded bg-gray-800"
        />
        <input
          type="text"
          placeholder="Длительность сна (ч:м)"
          value={sleepDuration}
          onChange={(e) => setSleepDuration(e.target.value)}
          className="w-full p-2 rounded bg-gray-800"
        />
        <textarea
          placeholder="Комментарий"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 rounded bg-gray-800"
        />
      </div>

      <button
        onClick={handleSave}
        className="mt-4 w-full bg-blue-600 py-2 rounded"
      >
        Сохранить
      </button>
    </div>
  );
};

export default DailyParametersMobile;

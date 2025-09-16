import { Chart, Goal, Watch, Review } from "@/components/Icons";
import LoginModal from "../features/LoginModal";
import { useLoginModal } from "../features/useLoginModal";
import { RegisterModal } from "@/features/RegisterModal";
import { useRegisterModal } from "../features/useRegisterModal";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";

export default function HomePage() {
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const location = useLocation();
  const navigate = useNavigate();

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (location.pathname === "/login") {
      loginModal.onOpen();
    }
  }, [location.pathname]);

  useEffect(() => {
    async function verifyToken() {
      const token = localStorage.getItem("token");
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const res = await fetch("http://87.249.50.183:4000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Токен недействителен");

        const data = await res.json();
        if (data?.userId) {
          navigate("/profile");
        } else {
          localStorage.removeItem("token");
        }
      } catch {
        localStorage.removeItem("token");
      } finally {
        setCheckingAuth(false);
      }
    }

    verifyToken();
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1C1C1E] text-white">
        Проверка авторизации...
      </div>
    );
  }

  return (
    <main className="bg-[#1C1C1E] text-white min-h-screen w-full font-sans pb-24">
      {/* Модальные окна */}
      <LoginModal isOpen={loginModal.isOpen} onClose={loginModal.onClose} />
      <RegisterModal isOpen={registerModal.isOpen} onClose={registerModal.onClose} />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <Header onLogin={loginModal.onOpen} onRegister={registerModal.onOpen} />

        {/* Hero */}
        <section className="bg-[#2A2A2E] rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between shadow-xl">
          <div className="space-y-6 max-w-lg">
            <h2 className="text-4xl font-bold leading-tight">
              Твой спорт. <br /> Твои цели.
            </h2>
            <p className="text-base text-gray-400">
              Следи за прогрессом, ставь цели и анализируй данные тренировок.
            </p>

            <div className="flex gap-4">
              <button
                onClick={loginModal.onOpen}
                className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-600 transition"
              >
                Начать
              </button>
              <button
                onClick={registerModal.onOpen}
                className="bg-gray-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-gray-600 transition"
              >
                Регистрация
              </button>
            </div>
          </div>

          <div className="mt-10 md:mt-0">
            <Chart dark />
          </div>
        </section>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-gray-300">
          <div className="flex flex-col items-center">
            <Goal dark className="w-10 h-10 mb-3" />
            <h3 className="font-semibold text-white mt-1">Достижение целей</h3>
            <p className="text-sm text-gray-400">
              Отслеживай прогресс и анализируй данные
            </p>
          </div>
          <div className="flex flex-col items-center">
            <Watch dark className="w-10 h-10 mb-3" />
            <h3 className="font-semibold text-white mt-1">Синхронизация с часами</h3>
            <p className="text-sm text-gray-400">
              Garmin, Apple Watch и другие устройства
            </p>
          </div>
          <div className="flex flex-col items-center">
            <Review dark className="w-10 h-10 mb-3" />
            <h3 className="font-semibold text-white mt-1">Отзывы пользователей</h3>
            <p className="text-sm text-gray-400">
              Что говорят другие об опыте использования
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}


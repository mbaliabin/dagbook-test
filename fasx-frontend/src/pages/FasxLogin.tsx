import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "@/api/loginUser";

export default function FasxLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token } = await loginUser(email, password);
      localStorage.setItem("token", token);
      navigate("/profile"); // редирект после успешного входа
    } catch (err: any) {
      setError(err.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl flex flex-col md:flex-row bg-[#111] rounded-2xl shadow-lg overflow-hidden">
        {/* Левая часть с описанием */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Welcome to <span className="text-blue-500">Fasx</span> Training Log
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            A modern tool for planning and logging and analyzing your training — with precision.
          </p>
        </div>

        {/* Правая часть — иконки + форма */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 border-t md:border-t-0 md:border-l border-gray-800">
          {/* Иконки сверху */}
          <div className="flex justify-around mb-8 text-sm sm:text-base">
            <div className="text-center hover:text-blue-500 cursor-pointer">
              <div className="text-xl sm:text-2xl mb-1">🏃</div>
              <div>Activities</div>
            </div>
            <div className="text-center hover:text-blue-500 cursor-pointer">
              <div className="text-xl sm:text-2xl mb-1">🤮</div>
              <div>Coach</div>
            </div>
            <div className="text-center hover:text-blue-500 cursor-pointer">
              <div className="text-xl sm:text-2xl mb-1">📊</div>
              <div>Knowledge</div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email or username</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                className="w-full p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-blue-500 text-black py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-400">
            Нет аккаунта?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-6 text-center px-4">
        Experiencing issues with Fasx? Contact us via{" "}
        <a href="mailto:support@fasx.no" className="text-blue-500">
          support@fasx.no
        </a>
      </p>
    </div>
  );
}


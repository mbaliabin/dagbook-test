import React, { useState } from "react";
import { registerUserTest } from "@/api/registerUserTest"; // API для тестовой регистрации

export default function FasxRegisterTest() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await registerUserTest(name, email, password);

      // Сообщение пользователю с инструкцией
      setSuccess(
        data.message || "Проверьте почту. Ссылка для подтверждения должна работать на любом устройстве."
      );
    } catch (err: any) {
      setError(err.message || "Произошла ошибка при регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl flex flex-col md:flex-row bg-[#111] rounded-2xl shadow-lg overflow-hidden">
        {/* Левая часть */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Test <span className="text-blue-500">Fasx</span> Registration
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            Temporary page for testing email verification flow.
          </p>
        </div>

        {/* Правая часть — форма */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 border-t md:border-t-0 md:border-l border-gray-800">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                type="text"
                autoComplete="name"
                className="w-full p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                autoComplete="email"
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
                autoComplete="new-password"
                className="w-full p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Register (Test)"}
            </button>
          </form>

          <div className="text-right mt-2 text-sm">
            <a href="/login-test" className="text-gray-400 hover:text-blue-500">
              Already have an account?
            </a>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-6 text-center px-4">
        Need help? Email us at{" "}
        <a href="mailto:support@fasx.no" className="text-blue-500">
          support@fasx.no
        </a>
      </p>
    </div>
  );
}

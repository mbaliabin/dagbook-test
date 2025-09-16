import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "@/api/registerUser";

export default function FasxRegister() {
  const [name, setName] = useState("");
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
      await registerUser(name, email, password);
      // можно сохранить токен, если API возвращает его:
      // localStorage.setItem("token", token);
      navigate("/profile");
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
            Join <span className="text-blue-500">Fasx</span> Today
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            Create an account to start planning and tracking your workouts.
          </p>
        </div>

        {/* Правая часть — форма */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 border-t md:border-t-0 md:border-l border-gray-800">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                type="text"
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
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <div className="text-right mt-2 text-sm">
            <a href="/login" className="text-gray-400 hover:text-blue-500">
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


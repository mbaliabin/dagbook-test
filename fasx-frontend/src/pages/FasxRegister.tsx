import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "@/api/registerUser";
import { Activity, ShieldCheck, BarChart3, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";

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
      navigate("/profile");
    } catch (err: any) {
      setError(err.message || "Произошла ошибка при регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 flex flex-col items-center justify-center px-4 py-6 font-sans selection:bg-blue-500/30">

      {/* Главный контейнер */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row bg-[#131316] rounded-3xl md:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-white/[0.03]">

        {/* Левая часть: Приветствие */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-gradient-to-br from-blue-600/10 to-transparent border-b md:border-b-0 md:border-r border-white/[0.05]">
          <div className="mb-6 md:mb-8 inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-blue-600 shadow-xl shadow-blue-500/20 border border-white/10">
            <Activity size={28} className="text-white stroke-[2.5px]" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 md:mb-6 tracking-tighter leading-tight">
            Стань частью <br />
            <span className="text-blue-500">Fasx</span> Team
          </h1>
          <p className="text-gray-400 text-sm md:text-lg leading-relaxed max-w-md font-medium">
            Создайте аккаунт, чтобы поднять свои тренировки на новый уровень.
          </p>
        </div>

        {/* Правая часть: Форма */}
        <div className="w-full md:w-1/2 p-6 md:p-16">

          {/* Преимущества системы (компактно) */}
          <div className="grid grid-cols-3 gap-3 mb-8 md:mb-10">
            {[
              { icon: Activity, label: "Трекинг" },
              { icon: ShieldCheck, label: "Безопасно" },
              { icon: BarChart3, label: "Графики" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-blue-500">
                  <item.icon size={16} />
                </div>
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-500 text-center">{item.label}</span>
              </div>
            ))}
          </div>

          <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
            {/* Поле: Имя */}
            <div className="space-y-1.5">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">
                Ваше имя
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input
                  type="text"
                  placeholder="Александр"
                  autoComplete="name"
                  className="w-full pl-12 pr-4 py-3 md:py-3.5 rounded-xl bg-black/40 border border-white/[0.05] text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700 text-sm md:text-base"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Поле: Email */}
            <div className="space-y-1.5">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3 md:py-3.5 rounded-xl bg-black/40 border border-white/[0.05] text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700 text-sm md:text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Поле: Пароль */}
            <div className="space-y-1.5">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 md:py-3.5 rounded-xl bg-black/40 border border-white/[0.05] text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700 text-sm md:text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full group bg-blue-600 hover:bg-blue-500 text-white py-3.5 md:py-4 rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-500/20 active:scale-[0.96] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Создать аккаунт
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-8 md:mt-10">
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Уже есть профиль?</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 text-[10px] md:text-xs font-black uppercase tracking-widest transition-colors"
            >
              Войти в систему
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 md:mt-10 text-center px-4">
        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
          Experiencing issues? Contact us at
        </p>
        <a href="mailto:support@fasx.no" className="text-blue-500/80 hover:text-blue-500 transition-colors text-[10px] md:text-xs font-medium">
          support@fasx.pro
        </a>
      </div>
    </div>
  );
}
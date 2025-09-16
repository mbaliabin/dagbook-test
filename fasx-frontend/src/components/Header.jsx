export default function Header({ onLogin, onRegister }) {
  return (
    <header className="flex justify-between items-center px-6 py-5 bg-[#1C1C1E] text-white">
      {/* Логотип */}
      <div className="flex items-center space-x-2">
        <span className="font-extrabold text-xl tracking-widest">F</span>
        <span className="font-semibold text-xl">FASX</span>
      </div>

      {/* Навигация */}
      <nav className="space-x-6 text-sm text-gray-300">
        <button
          onClick={onLogin}
          className="hover:text-white transition duration-200"
        >
          Войти
        </button>
        <button
          onClick={onRegister}
          className="hover:text-white transition duration-200"
        >
          Зарегистрироваться
        </button>
      </nav>
    </header>
  );
}


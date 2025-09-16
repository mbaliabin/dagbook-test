import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { useState } from "react";
import { registerUser } from "@/api/registerUser"; // абсолютный путь (если используешь alias @ на src)

export function RegisterModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser(name, email, password);
      // Если тебе вернётся token — можешь раскомментировать:
      // localStorage.setItem("token", token);
      onClose();
      // window.location.reload(); // или переход, если есть роутинг
    } catch (err: any) {
      setError(err.message || "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-[#2A2A2E] text-white rounded-2xl shadow-xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold">Регистрация</Dialog.Title>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm block mb-1">Имя</label>
              <input
                type="text"
                className="w-full p-2 rounded bg-[#1C1C1E] text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm block mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 rounded bg-[#1C1C1E] text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm block mb-1">Пароль</label>
              <input
                type="password"
                className="w-full p-2 rounded bg-[#1C1C1E] text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="bg-blue-500 w-full py-2 rounded-xl font-semibold hover:bg-blue-600 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Загрузка..." : "Зарегистрироваться"}
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}


export async function registerUserTest(name: string, email: string, password: string) {
  const res = await fetch("http://46.173.18.36:4000/api/auth/register-test", { // продовый сервер, тестовый роут
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || "Ошибка регистрации");
  }

  return data;
}

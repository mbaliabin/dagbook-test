export async function registerUser(name: string, email: string, password: string) {
  const res = await fetch("http://46.173.18.36:4000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Ошибка регистрации");
  }

  return data;
}


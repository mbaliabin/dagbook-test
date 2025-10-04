export async function registerUserTest(name: string, email: string, password: string) {
  const response = await fetch("http://localhost:4000/api/auth/register-test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Ошибка при регистрации");
  }

  return await response.json();
}

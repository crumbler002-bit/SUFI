import { apiRequest, setToken, clearToken } from "../lib/api";

export async function login(email: string, password: string) {
  const data = await apiRequest<{ access_token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.access_token);
  return data;
}

export async function register(name: string, email: string, password: string, role = "diner") {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });
}

export function logout() {
  clearToken();
}

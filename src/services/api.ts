const BASE_URL = "/api";

export function getAuthToken() {
  return localStorage.getItem("e_health_token");
}

export function setAuthToken(token: string) {
  localStorage.setItem("e_health_token", token);
}

export function removeAuthToken() {
  localStorage.removeItem("e_health_token");
}

async function request(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Lỗi hệ thống (${response.status})`);
  }

  return response.json();
}

export const api = {
  get: (path: string) => request(path, { method: "GET" }),
  post: (path: string, body: any) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path: string, body: any) => request(path, { method: "PUT", body: JSON.stringify(body) }),
};

const TOKEN_KEY = "medisys_auth_token";

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Đường dẫn tuyệt đối gọi thẳng vào Backend
const BASE_URL = "http://localhost:3000/api"; 

// Bỏ qua lỗi bắt buộc phải có type rõ ràng thay vì "any"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function request(method: string, path: string, body?: any) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Lỗi hệ thống (${response.status})`);
  }

  return data;
}

export const api = {
  get: (path: string) => request("GET", path),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: (path: string, body: any) => request("POST", path, body),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put: (path: string, body: any) => request("PUT", path, body),
  delete: (path: string) => request("DELETE", path),
};
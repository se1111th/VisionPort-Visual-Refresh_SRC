import { queryClient } from "./queryClient";

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (url: string) => fetch(url).then(handleResponse),
  post: (url: string, data: unknown) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(handleResponse),
  patch: (url: string, data: unknown) =>
    fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(handleResponse),
  delete: (url: string) =>
    fetch(url, { method: "DELETE" }).then(handleResponse),
};

export function invalidate(...keys: string[][]) {
  keys.forEach((k) => queryClient.invalidateQueries({ queryKey: k }));
}

/* Cliente da API. Em dev o Vite encaminha /api para o servidor (vite.config.js). */
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.erro || 'Erro inesperado. Tente novamente.'), { status: res.status });
  }
  return data;
}

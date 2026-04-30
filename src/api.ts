const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return undefined as T;
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  getDepartments: () => request<import('./types').Department[]>('/departments'),
  createDepartment: (data: Omit<import('./types').Department, 'id'>) =>
    request<import('./types').Department>('/departments', { method: 'POST', body: JSON.stringify(data) }),
  updateDepartment: (data: import('./types').Department) =>
    request<import('./types').Department>(`/departments/${data.id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDepartment: (id: string) =>
    request<void>(`/departments/${id}`, { method: 'DELETE' }),

  getPositions: () => request<import('./types').Position[]>('/positions'),
  createPosition: (data: Omit<import('./types').Position, 'id'>) =>
    request<import('./types').Position>('/positions', { method: 'POST', body: JSON.stringify(data) }),
  updatePosition: (data: import('./types').Position) =>
    request<import('./types').Position>(`/positions/${data.id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePosition: (id: string) =>
    request<void>(`/positions/${id}`, { method: 'DELETE' }),

  getEmployees: () => request<import('./types').Employee[]>('/employees'),
  createEmployee: (data: Omit<import('./types').Employee, 'id' | 'avatar'>) =>
    request<import('./types').Employee>('/employees', { method: 'POST', body: JSON.stringify(data) }),
  updateEmployee: (data: import('./types').Employee) =>
    request<import('./types').Employee>(`/employees/${data.id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEmployee: (id: string) =>
    request<void>(`/employees/${id}`, { method: 'DELETE' }),
};

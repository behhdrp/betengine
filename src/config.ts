// Configuração da API - mude aqui se necessário
export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  METRICS: `${API_BASE_URL}/api/user/metrics`,
  UPDATE_METRICS: `${API_BASE_URL}/api/user/metrics`,
  LINKS: `${API_BASE_URL}/api/user/links`,
  LINK_DETAIL: (linkId: string) => `${API_BASE_URL}/api/links/${linkId}`,
  LINK_STATS: (linkId: string) => `${API_BASE_URL}/api/links/${linkId}/stats`,
  USERS: `${API_BASE_URL}/api/admin/users`,
  UPDATE_USER: (userId: number) => `${API_BASE_URL}/api/admin/users/${userId}`,
  REWARDS: `${API_BASE_URL}/api/rewards`,
};

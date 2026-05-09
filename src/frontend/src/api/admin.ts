import axios from 'axios';
import { authHeader } from './auth';

const API = 'http://localhost:8000/api';

export async function getAdminStats() {
  const resp = await axios.get(`${API}/admin/stats`, { headers: authHeader() });
  return resp.data;
}

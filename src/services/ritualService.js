import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Create a separate axios instance for public endpoints
export const publicApi = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const ritualService = {
  getAllRituals: () => publicApi.get('/api/rituals'),
  getRitualById: (id) => publicApi.get(`/api/rituals/${id}`),
  getRitualsByRegion: (region) => publicApi.get(`/api/rituals/filter`), // Sửa endpoint filter
  searchRituals: (name) => publicApi.get(`/api/rituals/search`, { params: { name } }) // Sửa cách truyền params
};

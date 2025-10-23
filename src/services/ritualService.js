import axios from "axios";

const API_BASE_URL = "https://isp-7jpp.onrender.com";

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const ritualService = {
  getAllRituals: async () => {
    try {
      const res = await publicApi.get("/api/rituals");
      console.log("✅ API success:", res.data);
      return res.data;
    } catch (err) {
      console.error("❌ API error:", err);
      throw err;
    }
  },

    getRitualById: (id) => publicApi.get(`/api/rituals/${id}`),

    filterRitualsByRegions: async (regionNames = [], page = 0, size = 100) => {
    const res = await publicApi.get("/api/rituals/filter", {
      params: { regionNames, page, size },
    });
    const data = res?.data || {};
    return {
      page: data.number ?? 0,
      size: data.size ?? size,
      totalPages: data.totalPages ?? 1,
      totalElements: data.totalElements ?? (data.content?.length || 0),
      content: Array.isArray(data.content) ? data.content : [],
      raw: data,
    };
  },
};

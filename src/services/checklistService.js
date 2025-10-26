// src/services/checklistService.js
import axios from "axios";
import apiAuth from "./apiAuth"; // vẫn giữ để dùng cho các API có xác thực

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://isp-7jpp.onrender.com";

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false, // API công khai
});

export const checklistService = {
  // Hàm mới: Lấy checklist theo ritualId (sử dụng publicApi)
  getByRitual: async (ritualId) => {
    const res = await publicApi.get(`/api/checklists/ritual/${ritualId}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  // Hàm cũ: Lấy tất cả checklist (dùng apiAuth cho user's checklists)
  getChecklists: async () => {
    const response = await apiAuth.get("/api/checklists");
    return response.data;
  },
};

export default checklistService;
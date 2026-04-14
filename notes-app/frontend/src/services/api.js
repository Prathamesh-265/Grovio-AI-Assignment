import axios from "axios";

const getBaseURL = () => {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5000/api";
  }
  return "https://grovio-ai-assignment-1.onrender.com/api"; 
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.error || err.message || "Network error";
    return Promise.reject(new Error(message));
  },
);

export const notesApi = {
  list: (params = {}) => api.get("/notes", { params }),
  get: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post("/notes", data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  getTags: () => api.get("/notes/tags"),
  getVersions: (id) => api.get(`/notes/${id}/versions`),
  restoreVersion: (id, versionId) =>
    api.post(`/notes/${id}/versions/${versionId}/restore`),
};

export default api;

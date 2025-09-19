import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const storedData = localStorage.getItem("leadreach_auth");
  if (storedData) {
    try {
      const { token } = JSON.parse(storedData);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Failed to parse auth token:", error);
    }
  }
  return config;
});

export { api };

// API service functions
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  },
};

export const businessAPI = {
  getBusinessGroups: async () => {
    const response = await api.get("/businesses");
    return response.data;
  },

  generateBusinesses: async (
    keywords: string[],
    cities: string[],
    limit: number
  ) => {
    const response = await api.post("/businesses/discover", {
      keywords,
      cities,
      limit,
    });
    return response.data;
  },

  getGroupDetails: async (id: string) => {
    const response = await api.get(`/businesses/export/${id}`);
    return response.data;
  },

  downloadCSV: async (id: string) => {
    const response = await api.get(`/exports/${id}/download`, {
      responseType: "blob",
    });
    return response;
  },
};

import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  headers: { "Content-Type": "application/json" }
});

// Store userId in memory for interceptor access
let currentUserId: string | null = null;

export const setUserId = (userId: string | null) => {
  currentUserId = userId;
};

// Request interceptor to automatically inject x-user-id header
api.interceptors.request.use(
  (config) => {
    if (currentUserId) {
      config.headers["x-user-id"] = currentUserId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => {
    // Backend returns { success, message, data }
    // Return the whole response, components will access response.data.data
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      console.error("API Error:", error.response.data);
    } else if (error.request) {
      // Request was made but no response
      console.error("Network Error:", error.request);
    } else {
      // Something else happened
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

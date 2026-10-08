import axios from "axios";

const api =
  import.meta.env.VITE_API_BASE_URL || "https://nuesa-dinner-backend.onrender.com";

const instance = axios.create({
  baseURL: api,
  timeout: 60000, // 60s - Render free instances can cold-start slowly
  headers: {
    "Content-Type": "application/json",
  },
});


export default instance
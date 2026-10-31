import axios from "axios";
import { getPass, clearPass } from "../lib/bookingPass.js";

const api =
  import.meta.env.VITE_API_BASE_URL || "https://nuesa-dinner-backend.onrender.com";

const instance = axios.create({
  baseURL: api,
  timeout: 60000, // 60s - Render free instances can cold-start slowly
  headers: {
    "Content-Type": "application/json",
  },
});


// Send the booking pass (if this visitor has one) with every request
instance.interceptors.request.use((config) => {
  const pass = getPass();
  if (pass) config.headers["x-booking-pass"] = pass;
  return config;
});

// A pass the server no longer accepts (e.g. expired) is dropped
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response.data?.closed && getPass()) {
      clearPass();
    }
    return Promise.reject(error);
  }
);

export default instance
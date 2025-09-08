import axios from "axios";

const api = import.meta.env.VITE_API_BASE_URL;

const instance = axios.create({
  baseURL: api,
  timeout: 35000, // 35s timeout
  headers: {
    "Content-Type": "application/json",
  },
});


export default instance
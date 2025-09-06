import axios from "axios";

const api = import.meta.env.VITE_API_BASE_URL;

const instance = axios.create({
  baseURL: api,
  timeout: 20000, // 20s timeout
  headers: {
    "Content-Type": "application/json",
  },
});


export default instance
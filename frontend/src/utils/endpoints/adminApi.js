import axios from "../axiosInstance.js";

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const AdminAPI = {
  login: async (credentials) => {
    const response = await axios.post("/admin/login", credentials);
    return response.data;
  },
  getStats: async (token) => {
    const response = await axios.get("/admin/stats", authHeaders(token));
    return response.data;
  },
  getBookings: async (token, status = "") => {
    const url = status ? `/admin/bookings?status=${status}` : "/admin/bookings";
    const response = await axios.get(url, authHeaders(token));
    return response.data;
  },
  getActivity: async (token, limit = 60) => {
    const response = await axios.get(
      `/admin/activity?limit=${limit}`,
      authHeaders(token)
    );
    return response.data;
  },
  // Check-in (mark attendance) - admin only
  markSeat: async (token, bookingId, seatId) => {
    const response = await axios.post(
      `/booking/${bookingId}/mark-seat/${seatId}`,
      null,
      authHeaders(token)
    );
    return response.data;
  },
  checkInBooking: async (token, bookingId) => {
    const response = await axios.post(
      `/booking/verify/${bookingId}`,
      null,
      authHeaders(token)
    );
    return response.data;
  },
};

export default AdminAPI;

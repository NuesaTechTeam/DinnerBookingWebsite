import axios from "../axiosInstance.js"

const BookingAPI = {
    createBooking: async (bookingData) => {
        const response = await axios.post("/booking", bookingData)
        return response.data;
    },
    checkAvailability: async (seats) => {
        const response = await axios.post("/booking/check-availability", {seatIds: seats})
        return response.data;
    },
    // Removes an unpaid reservation when the Paystack popup is closed/cancelled
    abandonBooking: async (bookingId) => {
        const response = await axios.delete(`/booking/${bookingId}`)
        return response.data;
    },
}

export default BookingAPI

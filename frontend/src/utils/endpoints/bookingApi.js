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
}

export default BookingAPI
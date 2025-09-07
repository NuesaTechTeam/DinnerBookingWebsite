import axios from "../axiosInstance.js"

const PaymentAPI = {
    verifyPayment: async (paymentData) => {
        const response = await axios.post("/payment/verify", paymentData)
        return response.data;
    },
}

export default PaymentAPI
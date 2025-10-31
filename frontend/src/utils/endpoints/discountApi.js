import axios from "../axiosInstance.js";

const DiscountAPI = {
  verifyIsEngineering: async (invoiceNumber) => {
    const response = await axios.post("/discount/verify", { invoiceNumber });
    return response.data;
  },
};

export default DiscountAPI;
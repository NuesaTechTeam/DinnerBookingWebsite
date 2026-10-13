import axios from "../axiosInstance.js";

const DiscountAPI = {
  verifyIsEngineering: async ({ invoiceNumber, tableType }) => {
    const response = await axios.post("/discount/verify", {
      invoiceNumber,
      tableType,
    });
    return response.data;
  },
};

export default DiscountAPI;
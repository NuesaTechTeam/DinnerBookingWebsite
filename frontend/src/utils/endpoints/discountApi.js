import axios from "../axiosInstance.js";

const DiscountAPI = {
  verifyPromo: async ({ code, tableType }) => {
    const response = await axios.post("/discount/verify-promo", { code, tableType });
    return response.data;
  },
  verifyIsEngineering: async ({ invoiceNumber, tableType }) => {
    const response = await axios.post("/discount/verify", {
      invoiceNumber,
      tableType,
    });
    return response.data;
  },
};

export default DiscountAPI;
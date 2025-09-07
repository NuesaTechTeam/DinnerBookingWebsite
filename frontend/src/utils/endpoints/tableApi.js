import axios from "../axiosInstance.js";

const TableAPI = {
  getAllTables: async () => {
    const response =  await axios.get("/table");
    return response.data
  },
  getSeatsStatus: async (tableId) => {
    const response = await axios.post("/seat/status", {tableId: tableId})
    return response.data
  },
};

export default TableAPI

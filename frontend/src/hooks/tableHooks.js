import { useQuery } from "@tanstack/react-query";
import TableAPI from "../utils/endpoints/tableApi";
import { transformTables } from "../lib/helpers";

export const useTables = () => {
  return useQuery({
    queryKey: ["tables"],
    queryFn: () => TableAPI.getAllTables(),
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    retry: 2,
    select: (data) => {
      // Extract the data from the Axios response
      // response.data contains { success: true, data: Array(112) }
      if (data && data.success && Array.isArray(data.data)) {
        return transformTables(data.data);
      }
      console.warn("Unexpected API response structure:", data);
      return {
        VVIP: [],
        VIP: [],
        SILVER: [],
        REGULAR: [],
      };
    },
  });
};

export const useSeatsStatus = (tableId) => {
  return useQuery({
    queryKey: ["seatStatus", tableId],
    queryFn: () => TableAPI.getSeatsStatus(tableId),
    enabled: !!tableId,
    refetchInterval: 5 * 60 * 1000,
    keepPreviousData: true,
  });
};

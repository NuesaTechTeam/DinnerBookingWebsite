import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TableAPI from "../utils/endpoints/tableApi";
import BookingAPI from "../utils/endpoints/bookingApi";
// import { useToast } from "../context/modal/useToast";

export const useSeatManagement = (tableId) => {
  const queryClient = useQueryClient();
      // const {showToast, TOAST_TYPES} = useToast()
  

  // for seat status
  const seatStatusQuery = useQuery({
    queryKey: ["seatStatus", tableId],
    queryFn: () => TableAPI.getSeatsStatus(tableId),
    enabled: !!tableId,
    refetchInterval: 2 * 60 * 1000,
    keepPreviousData: true,
    retry: 2,
  });

  // for checking availabiltiy
  const availabilityMutation = useMutation({
    mutationFn: BookingAPI.checkAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries(["seatStatus", tableId]);
    },
  });

  return {
    seatStatus: seatStatusQuery.data,
    isLoading: seatStatusQuery.isLoading,
    error: seatStatusQuery.error,
    checkAvailability: availabilityMutation.mutate,
    isChecking: availabilityMutation.isLoading,
  };
};

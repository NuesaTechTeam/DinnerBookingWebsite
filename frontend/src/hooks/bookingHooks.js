import { useMutation, useQueryClient } from "@tanstack/react-query";
import BookingAPI from "../utils/endpoints/bookingApi";
import { useToast } from "../context/modal/useToast.js";


export const useCheckAvailability = () => {
    // const {showToast, TOAST_TYPES} = useToast()
    
    return useMutation({
        mutationFn: BookingAPI.checkAvailability,
        onError: (error) => {
            console.error(error);
            
        }
    })
}

export const useVerifyReservedPassword = () => {
    return useMutation({
        mutationFn: BookingAPI.verifyReservedPassword,
    })
}

export const useCreateBooking = () => {
    const { showToast, TOAST_TYPES } = useToast();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: BookingAPI.createBooking,
        onSuccess: () => {
            showToast("Booking created", TOAST_TYPES.SUCCESS);
            // console.log(data); 
        },
        onError: (error) => {
            const errorMessage =
              error.response?.data?.message || "Failed to create booking";
            showToast(errorMessage, TOAST_TYPES.ERROR);
            // Seats may have been taken/locked since the map loaded - refresh
            // availability so the guest can pick again
            // (409 = the price changed since the page loaded)
            if ([400, 409].includes(error.response?.status)) {
              queryClient.invalidateQueries({ queryKey: ["tables"] });
              queryClient.invalidateQueries({ queryKey: ["seatStatus"] });
            }
            console.error(error);
            
        }
    })
}
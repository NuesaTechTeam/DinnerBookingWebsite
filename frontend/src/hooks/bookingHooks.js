import { useMutation, } from "@tanstack/react-query";
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

export const useCreateBooking = () => {
    const { showToast, TOAST_TYPES } = useToast();
    return useMutation({
        mutationFn: BookingAPI.createBooking,
        onSuccess: () => {
            showToast("Booking created", TOAST_TYPES.SUCCESS);
            // console.log(data); 
        },
        onError: (error) => {
            const errorMessage =
              error.response?.data?.message || "Failed to create booking";
            showToast({errorMessage}, TOAST_TYPES.ERROR);
            console.error(error);
            
        }
    })
}
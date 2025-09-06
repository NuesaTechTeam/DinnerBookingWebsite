import { useMutation } from "@tanstack/react-query";
import PaymentAPI from "../utils/endpoints/paymentApi";
import { useToast } from "../context/modal/useToast";

export const useVerifyPayment = () => {
  const { showToast, TOAST_TYPES } = useToast();

  return useMutation({
    mutationFn: PaymentAPI.verifyPayment,
    onSuccess: (data) => {
      if (data.success) {
        showToast("Product created successfully", TOAST_TYPES.SUCCESS);
      } else {
        showToast(
          `Payment verification failed: ${data.message}`,
          TOAST_TYPES.ERROR
        );
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Payment verification failed";
      showToast({ errorMessage }, TOAST_TYPES.ERROR);

      console.error("Payment verification failed:", error);
    },
  });
};

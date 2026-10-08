import { useMutation } from "@tanstack/react-query";
import PaymentAPI from "../utils/endpoints/paymentApi";

// NOTE: UI feedback (toasts + retries) is handled by the caller so that a
// verification hiccup never looks like a lost payment.
export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: PaymentAPI.verifyPayment,
    onError: (error) => {
      console.error("Payment verification failed:", error);
    },
  });
};

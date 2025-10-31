import { useMutation } from "@tanstack/react-query";
import DiscountAPI from "../utils/endpoints/discountApi";

export const useVerifyEngineeringStudent = () => {
  // const {showToast, TOAST_TYPES} = useToast()

  return useMutation({
    mutationFn: DiscountAPI.verifyIsEngineering,
    onError: (error) => {
      console.error(error);
    },
  });
};

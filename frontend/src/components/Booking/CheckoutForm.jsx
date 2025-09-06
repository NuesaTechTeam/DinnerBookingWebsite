import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  CreditCard,
  Shield,
  CheckCircle,
} from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import { useCreateBooking } from "../../hooks/bookingHooks";
import { useVerifyPayment } from "../../hooks/paymentHooks";
import { useToast } from "../../context/modal/useToast";
import { useQueryClient } from "@tanstack/react-query";

const fadeInUp = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const CheckoutForm = ({
  onClose = () => {},
  selectedSeats = [],
  baseAmount = 0,
  selectedTable,
  seatNames,
}) => {
  const createBookingMutation = useCreateBooking();
  const verifyPaymentMutation = useVerifyPayment();
  const { showToast, TOAST_TYPES } = useToast();
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    name: "",
    matricNo: "",
    email: "",
    phone: "",
    isEngineering: false,
  });
  // const [otpData, setOtpData] = useState({
  //   otp: "",
  //   isOtpSent: false,
  //   isOtpVerified: false,
  //   isLoading: false,
  // });
  // const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const isProcessing =
    createBookingMutation.isPending || verifyPaymentMutation.isPending;

  //payment calculation
  const paystackFeePercentage = 3.5;
  const paystackFixedFee = 100;

  const calculateTotalAmount = (baseAmount) => {
    const calculatedFee =
      (paystackFeePercentage / 100) * baseAmount + paystackFixedFee;
    const totalFee = Math.min(calculatedFee, 2000); //cap at 2000
    return Math.round(baseAmount + totalFee);
  };

  const totalAmount = calculateTotalAmount(baseAmount);
  // const feeAmount = totalAmount - baseAmount;

  // const discount = otpData.isOtpVerified ? 2000 : 0;
  // const finalAmount = baseAmount - discount;

  const paystackConfig = {
    publicKey: import.meta.env.VITE_PUBLIC_KEY_PAYSTACK,
    email: formData.email,
    amount: totalAmount * 100,
    metadata: {
      custom_fields: [
        {
          display_name: "Full Name",
          variable_name: "full_name",
          value: formData.name,
        },
        {
          display_name: "Matric Number",
          variable_name: "matric_no",
          value: formData.matricNo,
        },
        {
          display_name: "Phone Number",
          variable_name: "phone",
          value: formData.phone,
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const onPaymentSuccess = (response, bookingId) => {
    
    verifyPaymentMutation.mutate(
      {
        reference: response.reference,
        bookingId: bookingId,
      },
      {
        onSuccess: (verifyData) => {
          if (verifyData.success) {
            showToast(
              "Payment successful! Confirmation email sent.",
              TOAST_TYPES.SUCCESS
            );
queryClient.invalidateQueries(["tables"]);
            onClose();
          } else {
            showToast(
              "Payment verification failed: " + verifyData.data.message,
              TOAST_TYPES.ERROR
            );
          }
        },
        onError: (error) => {
          showToast(
            `Payment verification error: ${error.message}`,
            TOAST_TYPES.ERROR
          );
        }
      }
    );
  };

  const onPaymentClose = () => {
    console.log("Payment window closed");
    window.location.reload()
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // const handleSendOtp = async () => {
  //   if (!formData.email || !formData.isEngineering) return;

  //   setOtpData((prev) => ({ ...prev, isLoading: true }));

  //   // Simulate OTP sending - replace with actual API call
  //   setTimeout(() => {
  //     setOtpData((prev) => ({
  //       ...prev,
  //       isOtpSent: true,
  //       isLoading: false,
  //     }));
  //   }, 1500);
  // };

  // const handleVerifyOtp = async () => {
  //   if (!otpData.otp) return;

  //   setOtpData((prev) => ({ ...prev, isLoading: true }));

  //   // Simulate OTP verification - replace with actual API call
  //   setTimeout(() => {
  //     const isValid = otpData.otp === "123456"; // Mock verification
  //     setOtpData((prev) => ({
  //       ...prev,
  //       isOtpVerified: isValid,
  //       isLoading: false,
  //     }));
  //   }, 1000);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (
      !formData.name ||
      !formData.matricNo ||
      !formData.email ||
      !formData.phone
    ) {
       showToast(
         "Please fill in all required fields",
         TOAST_TYPES.INFO
       );
      return;
    }

     if (selectedSeats.length === 0) {
       showToast(
         "Please select at least one seat",
         TOAST_TYPES.INFO
       );
       return;
     }

    // if (formData.isEngineering && !otpData.isOtpVerified) {
    //   showToast("Please verify your engineering student status", TOAST_TYPES.INFO);
    //   return;
    // }

    //create booking data
    const bookingData = {
      ...formData,
      seatIds: selectedSeats,
      amount: baseAmount, //without fees
      totalAmount: totalAmount, // with fees
      tableId: selectedTable?._id,
      tableType: selectedTable?.type,
    };

    //create booking first, then initialize payment after success
    createBookingMutation.mutate(bookingData, {
      onSuccess: (bookingResponse) => {
        if(bookingResponse.success) {
          const bookingId = bookingResponse.booking._id
          //initialize payment
          initializePayment({
            ...paystackConfig,
            metadata: {
              ...paystackConfig.metadata,
              bookingId: bookingResponse.booking._id,
            },
            onSuccess: (response) => onPaymentSuccess(response, bookingId),
            onClose: onPaymentClose,
          });
        } else {
           showToast("Failed to create booking: " + bookingResponse.message, TOAST_TYPES.ERROR);
        }
      } 
    })
  };


  return (
    <AnimatePresence>
      <Motion.div
        className="flex bg-black bg-opacity-50 items-center justify-center p-4 w-full max-w-md mx-auto"
        {...scaleIn}
      >
        <Motion.div
          className="bg-gradient-to-br from-gray-900 to-black border-2 border-red-600 rounded-lg shadow-2xl"
          style={{
            boxShadow:
              "0 0 50px rgba(220, 38, 38, 0.3), inset 0 0 20px rgba(220, 38, 38, 0.1)",
          }}
          {...fadeInUp}
        >
          {/* Header */}
          <Motion.div
            className="bg-gradient-to-r from-red-900 to-red-700 p-6 rounded-t-lg relative overflow-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="relative flex items-center justify-between">
              <Motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-white tracking-wide">
                  CASABLANCA
                </h2>
                <p className="text-red-200 text-sm italic">Join The Famiglia</p>
              </Motion.div>
              <Motion.button
                onClick={onClose}
                disabled={isProcessing}
                className="text-white hover:text-red-300 transition-colors p-2 cursor-pointer"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <X size={24} />
              </Motion.button>
            </div>
          </Motion.div>

          {/* Form Content */}
          <Motion.form
            className="p-6 space-y-4 bg-gradient-to-b from-gray-900 to-black"
            {...staggerContainer}
            onSubmit={handleSubmit}
          >
            {/* Seats Summary */}
            <Motion.div
              className="bg-red-950 bg-opacity-30 border border-red-800 rounded-lg p-3 mb-4"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-white text-sm">
                <p>
                  <span className="text-red-300">Selected Seats:</span>{" "}
                  {seatNames.join(", ")}
                </p>
                <p>
                  <span className="text-red-300">Amount:</span> ₦
                  {baseAmount.toLocaleString()}
                </p>
                <p>
                  <span className="text-xs my-2 text-red-300">
                    Charges or discount may apply
                  </span>
                </p>
                {/* {discount > 0 && (
                <Motion.p
                  className="text-green-400"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="text-red-300">Engineering Discount:</span> -₦
                  {discount.toLocaleString()}
                </Motion.p>
              )} */}
                <p className="text-xl font-bold mt-2 text-white border-t border-red-800 pt-2">
                  Total: ₦{totalAmount.toLocaleString()}
                </p>
              </div>
            </Motion.div>

            {/* Name Field */}
            <Motion.div
              className="space-y-2"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <label className="text-red-300 text-sm font-medium flex items-center gap-2">
                <User size={16} />
                Full Name
              </label>
              <Motion.input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
                placeholder="Enter your full name"
                className="w-full capitalize bg-black bg-opacity-50 border border-red-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                whileFocus={{ scale: 1.02, borderColor: "#ef4444" }}
              />
            </Motion.div>

            {/* Matric No Field */}
            <Motion.div
              className="space-y-2"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <label className="text-red-300 text-sm font-medium flex items-center gap-2">
                <Shield size={16} />
                Matric Number
              </label>
              <Motion.input
                type="text"
                name="matricNo"
                value={formData.matricNo}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
                placeholder="e.g., 18/ENG01/001"
                className="w-full bg-black uppercase bg-opacity-50 border border-red-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                whileFocus={{ scale: 1.02, borderColor: "#ef4444" }}
              />
            </Motion.div>

            {/* Email Field */}
            <Motion.div
              className="space-y-2"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <label className="text-red-300 text-sm font-medium flex items-center gap-2">
                <Mail size={16} />
                Email Address
              </label>
              <Motion.input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
                inputMode="email"
                placeholder="your.email@example.com"
                className="w-full bg-black bg-opacity-50 border border-red-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                whileFocus={{ scale: 1.02, borderColor: "#ef4444" }}
              />
            </Motion.div>

            {/* Phone Field */}
            <Motion.div
              className="space-y-2"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <label className="text-red-300 text-sm font-medium flex items-center gap-2">
                <Phone size={16} />
                Phone Number
              </label>
              <Motion.input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
                inputMode="tel"
                placeholder="+234123456789"
                className="w-full bg-black bg-opacity-50 border border-red-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                whileFocus={{ scale: 1.02, borderColor: "#ef4444" }}
              />
            </Motion.div>

            {/* Engineering Student Checkbox */}
            <Motion.div
              className="bg-red-950 bg-opacity-20 border border-red-800 rounded-lg p-4 space-y-3"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <label className="flex items-center space-x-3 cursor-pointer">
                <Motion.input
                  type="checkbox"
                  name="isEngineering"
                  checked={formData.isEngineering}
                  onChange={handleInputChange}
                  className="form-checkbox h-5 w-5 text-red-600 bg-black border-red-800 rounded focus:ring-red-500 focus:ring-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                />
                <span className="text-white text-sm">
                  I am an Engineering student
                </span>
              </label>

              {/* OTP Section */}
              {/* {formData.isEngineering && (
              <Motion.div
                className="space-y-3 mt-4 pt-3 border-t border-red-800"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
              >
                {!otpData.isOtpSent ? (
                  <Motion.button
                    // onClick={handleSendOtp}
                    disabled={!formData.email || otpData.isLoading}
                    className="w-full bg-red-700 hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {otpData.isLoading ? (
                      <Motion.div
                        className="rounded-full h-4 w-4 border-b-2 border-white"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    ) : (
                      <>
                        <Mail size={16} />
                        Send Verification OTP
                      </>
                    )}
                  </Motion.button>
                ) : !otpData.isOtpVerified ? (
                  <Motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex gap-2">
                      <Motion.input
                        type="text"
                        value={otpData.otp}
                        onChange={(e) =>
                          setOtpData((prev) => ({
                            ...prev,
                            otp: e.target.value,
                          }))
                        }
                        placeholder="Enter OTP"
                        className="flex-1 bg-black bg-opacity-50 border border-red-800 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        whileFocus={{ scale: 1.02 }}
                      />
                      <Motion.button
                        onClick={handleVerifyOtp}
                        disabled={!otpData.otp || otpData.isLoading}
                        className="bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {otpData.isLoading ? (
                          <Motion.div
                            className="rounded-full h-4 w-4 border-b-2 border-white"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                        ) : (
                          "Verify"
                        )}
                      </Motion.button>
                    </div>
                    <p className="text-xs text-gray-400">
                      OTP sent to {formData.email}
                    </p>
                  </Motion.div>
                ) : (
                  <Motion.div
                    className="flex items-center gap-2 text-green-400 text-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    <CheckCircle size={16} />
                    Engineering student status verified! ₦2,000 discount
                    applied.
                  </Motion.div>
                )}
              </Motion.div>
            )} */}
            </Motion.div>

            {/* Payment Button */}
            <Motion.button
              type="submit"
              // onClick={handlePayment}
              disabled={isProcessing || selectedSeats.length === 0}
              className="w-full bg-gradient-to-r cursor-pointer from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 disabled:from-gray-700 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 25px rgba(220, 38, 38, 0.5)",
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              {isProcessing ? (
                <Motion.div
                  className="rounded-full h-6 w-6 border-b-2 border-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  <CreditCard size={20} />
                  Pay ₦{totalAmount.toLocaleString()}
                </>
              )}
            </Motion.button>

            <Motion.p
              className="text-xs text-gray-400 text-center mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              Secure payment powered by Paystack
            </Motion.p>

            {/* Error messages */}
            {createBookingMutation.isError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                Booking failed:{" "}
                {createBookingMutation.error.response?.data?.message ||
                  createBookingMutation.error.message}
              </div>
            )}

            {verifyPaymentMutation.isError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                Payment verification failed:{" "}
                {verifyPaymentMutation.error.response?.data?.message ||
                  verifyPaymentMutation.error.message}
              </div>
            )}
          </Motion.form>
        </Motion.div>
      </Motion.div>
    </AnimatePresence>
  );
};

export default CheckoutForm;

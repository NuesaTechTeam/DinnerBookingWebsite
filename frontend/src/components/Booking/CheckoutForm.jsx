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
  Receipt,
} from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import { useCreateBooking } from "../../hooks/bookingHooks";
import { useVerifyPayment } from "../../hooks/paymentHooks";
import { useToast } from "../../context/modal/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { useVerifyEngineeringStudent } from "../../hooks/discountHooks";

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
  const verifyEngineeringStudent = useVerifyEngineeringStudent();
  const { showToast, TOAST_TYPES } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    matricNo: "",
    email: "",
    phone: "",
    isEngineering: false,
    invoiceNumber: "",
  });

  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [verifyingDiscount, setVerifyingDiscount] = useState(false);

  // Calculate Amount
  const isRegularTable = selectedTable?.type === "REGULAR";
  const finalAmount = Math.max(
    0,
    baseAmount - (discountApplied ? discountAmount : 0)
  );

  const applyDiscount = async () => {
    if (!formData.invoiceNumber.trim()) {
      showToast("Please enter an invoice number", TOAST_TYPES.INFO);
      return;
    }
    if (!isRegularTable) {
      showToast("Discounts apply only to REGULAR tables", TOAST_TYPES.INFO);
      return;
    }
    setVerifyingDiscount(true);

    try {
      const result = await verifyEngineeringStudent.mutateAsync(
        formData.invoiceNumber.trim()
      );

      if (result.success) {
        setDiscountApplied(true);
        setDiscountAmount(2000);
        showToast("Engineering Discount Applied", TOAST_TYPES.SUCCESS);
      } else {
        showToast(
          result.message || "Failed to verify discount",
          TOAST_TYPES.ERROR
        );
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to verify discount",
        TOAST_TYPES.ERROR
      );
    } finally {
      setVerifyingDiscount(false);
    }
  };

  const removeDiscount = () => {
    setDiscountApplied(false);
    setDiscountAmount(0);
    setFormData((prev) => ({ ...prev, invoiceNumber: "" }));
  };

  const isProcessing =
    createBookingMutation.isPending || verifyPaymentMutation.isPending;

  // Payment calculation
  const paystackFeePercentage = 5;
  const paystackFixedFee = 100;

  const calculateTotalAmount = (baseAmt) => {
    const calculatedFee =
      (paystackFeePercentage / 100) * baseAmt + paystackFixedFee;
    const totalFee = Math.min(calculatedFee, 3000); // cap at 3000
    return Math.round(baseAmt + totalFee);
  };

  const totalAmount = calculateTotalAmount(finalAmount);

  const paystackConfig = {
    publicKey: import.meta.env.VITE_PUBLIC_KEY_PAYSTACK,
    email: formData.email,
    amount: totalAmount * 100,
    split_code: import.meta.env.VITE_PAYSTACK_SPLIT_CODE,
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
        },
      }
    );
  };

  const onPaymentClose = () => {
    window.location.reload();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.matricNo ||
      !formData.email ||
      !formData.phone
    ) {
      showToast("Please fill in all required fields", TOAST_TYPES.INFO);
      return;
    }

    if (selectedSeats.length === 0) {
      showToast("Please select at least one seat", TOAST_TYPES.INFO);
      return;
    }

    const bookingData = {
      ...formData,
      seatIds: selectedSeats,
      baseAmount: baseAmount,
      totalAmount: totalAmount,
      tableId: selectedTable?._id,
      tableType: selectedTable?.type,
      invoiceNumber: discountApplied ? formData.invoiceNumber : undefined,
    };

    createBookingMutation.mutate(bookingData, {
      onSuccess: (bookingResponse) => {
        if (bookingResponse.success) {
          const bookingId = bookingResponse.booking._id;
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
          showToast(
            "Failed to create booking: " + bookingResponse.message,
            TOAST_TYPES.ERROR
          );
        }
      },
    });
  };

  return (
    <AnimatePresence>
      <Motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
        {...scaleIn}
      >
        <Motion.div
          className="w-full max-w-md bg-[#09090b] border border-[#d4af37]/40 rounded-xl shadow-2xl my-8 overflow-hidden"
          style={{
            boxShadow:
              "0 0 50px rgba(212, 175, 55, 0.15), inset 0 0 20px rgba(212, 175, 55, 0.05)",
          }}
          {...fadeInUp}
        >
          {/* Header */}
          <Motion.div
            className="bg-gradient-to-r from-[#141414] via-[#1a1813] to-[#141414] border-b border-[#d4af37]/30 p-6 relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative flex items-center justify-between">
              <Motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] tracking-wider uppercase">
                  FÀÁJÍ LAWA 
                </h2>
                <p className="text-[#d4af37]/80 text-xs tracking-widest font-light uppercase">
                  • RESERVE YOUR seat
                </p>
              </Motion.div>
              <Motion.button
                onClick={onClose}
                disabled={isProcessing}
                className="text-gray-400 hover:text-[#d4af37] transition-colors p-2 cursor-pointer"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <X size={22} />
              </Motion.button>
            </div>
          </Motion.div>

          {/* Form Content */}
          <Motion.form
            className="p-6 space-y-4 bg-[#09090b]"
            {...staggerContainer}
            onSubmit={handleSubmit}
          >
            {/* Seats Summary */}
            <Motion.div
              className="bg-[#121212] border border-[#d4af37]/30 rounded-lg p-4 mb-4"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-white text-sm space-y-1">
                <p className="flex justify-between">
                  <span className="text-gray-400">Selected Seats:</span>{" "}
                  <span className="font-semibold text-white">{seatNames.join(", ")}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Base Amount:</span>{" "}
                  <span className="text-white font-medium">₦{finalAmount.toLocaleString()}</span>
                </p>
                {discountApplied && (
                  <Motion.p
                    className="flex justify-between text-emerald-400"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <span>Engineering Discount:</span>{" "}
                    <span>-₦{discountAmount.toLocaleString()}</span>
                  </Motion.p>
                )}
                <p className="text-xs text-gray-400 pt-1">
                  * Paystack processing fee included at final total
                </p>
                <div className="flex justify-between items-center text-lg font-bold text-[#d4af37] border-t border-[#d4af37]/20 pt-3 mt-2">
                  <span>Total Amount:</span>
                  <span>₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </Motion.div>

            {/* Name Field */}
            <Motion.div
              className="space-y-1.5"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <label className="text-gray-300 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                <User size={14} className="text-[#d4af37]" />
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
                className="w-full capitalize bg-black/60 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-[#d4af37] focus:outline-none transition-colors"
                whileFocus={{ scale: 1.01 }}
              />
            </Motion.div>

            {/* Matric No Field */}
            <Motion.div
              className="space-y-1.5"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <label className="text-gray-300 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                <Shield size={14} className="text-[#d4af37]" />
                Matric Number
              </label>
              <Motion.input
                type="text"
                name="matricNo"
                value={formData.matricNo}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
                placeholder="e.g., 21/ENG01/001"
                className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm uppercase placeholder-gray-600 focus:border-[#d4af37] focus:outline-none transition-colors"
                whileFocus={{ scale: 1.01 }}
              />
            </Motion.div>

            {/* Email Field */}
            <Motion.div
              className="space-y-1.5"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <label className="text-gray-300 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                <Mail size={14} className="text-[#d4af37]" />
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
                className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-[#d4af37] focus:outline-none transition-colors"
                whileFocus={{ scale: 1.01 }}
              />
            </Motion.div>

            {/* Phone Field */}
            <Motion.div
              className="space-y-1.5"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <label className="text-gray-300 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                <Phone size={14} className="text-[#d4af37]" />
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
                className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-[#d4af37] focus:outline-none transition-colors"
                whileFocus={{ scale: 1.01 }}
              />
            </Motion.div>

            {/* Engineering Student Checkbox */}
            <Motion.div
              className="bg-black/40 border border-gray-800 rounded-lg p-3.5 space-y-3"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <label className="flex items-center space-x-3 cursor-pointer">
                <Motion.input
                  type="checkbox"
                  name="isEngineering"
                  checked={formData.isEngineering}
                  onChange={handleInputChange}
                  className="form-checkbox h-4 w-4 text-[#d4af37] bg-black border-gray-700 rounded focus:ring-[#d4af37] focus:ring-1"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                />
                <span className="text-gray-300 text-xs font-medium">
                  I am an Engineering student
                </span>
              </label>

              {/* Discount Section */}
              {formData.isEngineering && isRegularTable && (
                <Motion.div
                  className="space-y-3 mt-3 pt-3 border-t border-gray-800"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {!discountApplied ? (
                    <Motion.div
                      className="space-y-2"
                      {...fadeInUp}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      <label className="text-gray-300 text-xs font-medium flex items-center gap-2">
                        <Receipt size={14} className="text-[#d4af37]" />
                        Engineering Discount Code / Invoice
                      </label>
                      <div className="flex gap-2">
                        <Motion.input
                          type="text"
                          name="invoiceNumber"
                          value={formData.invoiceNumber}
                          onChange={handleInputChange}
                          disabled={verifyingDiscount || isProcessing}
                          inputMode="numeric"
                          placeholder="Enter invoice number"
                          className="flex-1 bg-black/60 border border-gray-800 rounded-lg px-3 py-2 text-white text-xs placeholder-gray-600 focus:border-[#d4af37] focus:outline-none"
                          whileFocus={{ scale: 1.01 }}
                        />
                        <Motion.button
                          type="button"
                          onClick={applyDiscount}
                          disabled={
                            verifyingDiscount ||
                            isProcessing ||
                            !formData.invoiceNumber.trim()
                          }
                          className="bg-[#d4af37] hover:bg-[#b38728] disabled:bg-gray-800 text-black font-semibold px-3 py-2 rounded-lg transition-colors text-xs uppercase tracking-wider"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {verifyingDiscount ? (
                            <Motion.div
                              className="rounded-full h-3.5 w-3.5 border-b-2 border-black"
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />
                          ) : (
                            "Apply"
                          )}
                        </Motion.button>
                      </div>
                    </Motion.div>
                  ) : (
                    <Motion.div
                      className="flex items-center justify-between text-emerald-400 text-xs bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-lg"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} />
                        <span>Verified! ₦2,000 discount applied.</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeDiscount}
                        className="text-gray-400 hover:text-white underline text-[11px]"
                      >
                        Remove
                      </button>
                    </Motion.div>
                  )}
                </Motion.div>
              )}
            </Motion.div>

            {/* Payment Button */}
            <Motion.button
              type="submit"
              disabled={isProcessing || selectedSeats.length === 0}
              className="w-full bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] text-black font-extrabold py-3.5 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:brightness-110 cursor-pointer mt-4"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              {isProcessing ? (
                <Motion.div
                  className="rounded-full h-5 w-5 border-b-2 border-black"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  <CreditCard size={18} />
                  Pay ₦{totalAmount.toLocaleString()}
                </>
              )}
            </Motion.button>

            <Motion.p
              className="text-[11px] text-gray-500 text-center mt-2 uppercase tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              Secure payment powered by Paystack
            </Motion.p>

            {/* Error messages */}
            {createBookingMutation.isError && (
              <div className="bg-red-950/40 border border-red-800 text-red-300 p-3 rounded-lg text-xs">
                Booking failed:{" "}
                {createBookingMutation.error.response?.data?.message ||
                  createBookingMutation.error.message}
              </div>
            )}

            {verifyPaymentMutation.isError && (
              <div className="bg-red-950/40 border border-red-800 text-red-300 p-3 rounded-lg text-xs">
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
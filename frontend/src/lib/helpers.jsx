import { Crown, Shield, Star, Users } from "lucide-react";

export const getSectionPrice = (type) => {
  switch (type) {
    case "VVIP":
      return "₦40,000";
    case "VIP":
      return "₦25,000";
    case "SILVER":
      return "₦18,000";
    case "REGULAR":
      return "₦1,000";
    default:
      return "₦8,000";
  }
};

export const getSectionColor = (type) => {
  switch (type) {
    case "VVIP":
      return "from-yellow-600 to-yellow-800";
    case "VIP":
      return "from-red-600 to-red-800";
    case "SILVER":
      return "from-gray-400 to-gray-600";
    default:
      return "from-amber-700 to-amber-900";
  }
};

export const getSectionIcon = (type) => {
  switch (type) {
    case "VVIP":
      return <Crown size={14} />;
    case "VIP":
      return <Star size={14} />;
    case "SILVER":
      return <Shield size={14} />;
    default:
      return <Users size={14} />;
  }
};

  export const extractSeatNumber = (seatName) => {
    const match = seatName.match(/S(\d+)$/);
    return match ? parseInt(match[1]) : null;
  };


    //   const paystackConfig = {
    //     reference: `booking_${booking._id}_${Date.now()}`,
    //     email: formData.email,
    //     amount: finalAmount * 100, // Paystack expects amount in kobo
    //     publicKey: "your-paystack-public-key",
    //     text: `Pay ₦${finalAmount.toLocaleString()}`,
    //     metadata: {
    //       bookingId: booking._id,
    //       custom_fields: [
    //         {
    //           display_name: "Booking ID",
    //           variable_name: "booking_id",
    //           value: booking._id,
    //         },
    //       ],
    //     },
    //     onSuccess: (reference) => {
    //       console.log("Payment successful:", reference);
    //       // Handle successful payment
    //       setIsPaymentLoading(false);
    //     },
    //     onClose: () => {
    //       setIsPaymentLoading(false);
    //     },
    //   };



   export const transformTables = (tablesArray) => {
      const sortedTables = {
        VVIP: [],
        VIP: [],
        SILVER: [],
        REGULAR: [],
      };

      tablesArray.forEach((table) => {
        if (Object.prototype.hasOwnProperty.call(sortedTables, table.type)) {
          sortedTables[table.type].push(table);
        }
      });

      // Sort each category by tableNumber
      Object.keys(sortedTables).forEach((type) => {
        sortedTables[type].sort((a, b) => {
          const getTableNumber = (tableName) => {
            const match = tableName.match(/-(\d+)$/);
            return match ? parseInt(match[1]) : 0;
          };
          return getTableNumber(a.tableNumber) - getTableNumber(b.tableNumber);
        });
      });

      return sortedTables;
    };
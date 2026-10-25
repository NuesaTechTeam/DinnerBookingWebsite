import { Student } from "../models/studentModel.js";

//fixed discount amount (default / Bronze + Gold)
export const ENGINEERING_DISCOUNT_AMOUNT = 2000;

// Engineering students get a tier-based discount per seat:
// Bronze and Gold take ₦2,000 off; Platinum takes ₦3,000 off.
const ENGINEERING_DISCOUNT_BY_TIER = {
  REGULAR: 2000,
  VIP: 2000,
  VVIP: 3000,
};

export const getEngineeringDiscountPerSeat = (tableType) =>
  ENGINEERING_DISCOUNT_BY_TIER[String(tableType || "").toUpperCase()] ??
  ENGINEERING_DISCOUNT_AMOUNT;

export const verifyEngineeringStudent = async (req, res) => {
  try {
    const { invoiceNumber, tableType } = req.body;
    const perSeat = getEngineeringDiscountPerSeat(tableType);

    if (!invoiceNumber) {
      return res.status(400).json({
        success: false,
        message: "Invoice number is required",
      });
    }

    // Find student by invoice number (which serves as coupon code)
    const student = await Student.findOne({
      invoiceNumber: invoiceNumber.toUpperCase().trim(),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Invalid invoice number. Please check and try again.",
      });
    }

    if (student.discountUsed) {
      return res.status(400).json({
        success: false,
        message:
          "This discount has already been used. Each invoice number can only be used once.",
      });
    }

    // Return success with student info and discount amount
    res.json({
      success: true,
      message: `Engineering student verified successfully. ₦${perSeat.toLocaleString()} off this seat!`,
      discount: {
        amount: perSeat,
        type: "fixed",
        applicableTo: "all tiers",
      },
      student: {
        fullName: student.fullName,
        matricNo: student.matricNo,
        department: student.department,
        level: student.level,
        invoiceNumber: student.invoiceNumber,
      },
    });
  } catch (error) {
    console.error("Verify student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify student. Please try again.",
    });
  }
};


// Mark discount as used after successful booking
export const markDiscountUsed = async (invoiceNumber, bookingId) => {
  try {
    const student = await Student.findOneAndUpdate(
      { invoiceNumber: invoiceNumber.toUpperCase().trim() },
      {
        discountUsed: true,
        discountUsedOn: new Date(),
        discountUsedForBooking: bookingId
      },
      { new: true }
    );

    return student;
  } catch (error) {
    console.error('Mark discount used error:', error);
    throw error;
  }
};
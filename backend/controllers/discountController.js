import { Student } from "../models/studentModel.js";

//fixed discount amount
export const ENGINEERING_DISCOUNT_AMOUNT = 2000;

export const verifyEngineeringStudent = async (req, res) => {
  try {
    const { invoiceNumber } = req.body;

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
      message:
        "Engineering student verified successfully. ₦2,000 discount applied!",
      discount: {
        amount: ENGINEERING_DISCOUNT_AMOUNT,
        type: "fixed",
        applicableTo: "REGULAR tables only",
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
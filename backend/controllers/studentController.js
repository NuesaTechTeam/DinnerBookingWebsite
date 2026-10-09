import { Student } from "../models/studentModel.js";
import { sendHtmlEmail } from "../utils/emailService.js";
import generateEmailTemplate from "../utils/emailTemplate.js";

// Normalise a header/key so we can match it regardless of formatting
// e.g. "Invoice Number" -> "invoicenumber"
const normalizeKey = (key) => String(key).toLowerCase().replace(/[^a-z0-9]/g, "");

const findValue = (row, predicate) => {
  const key = Object.keys(row).find((k) => predicate(normalizeKey(k)));
  return key ? row[key] : undefined;
};

const clean = (value) => {
  if (value === undefined || value === null) return undefined;
  const str = String(value).trim();
  return str === "" ? undefined : str;
};

// Map a Google Sheet / form row to a Student document using flexible header names
const mapRow = (row) => {
  const invoiceNumber = clean(
    findValue(
      row,
      (k) => k.includes("invoice") || k.includes("receipt") || k.includes("coupon")
    )
  );

  if (!invoiceNumber) return null;

  const upperInvoice = invoiceNumber.toUpperCase();

  const fullName =
    clean(
      findValue(row, (k) => k.includes("studentname") || k.includes("fullname") || k === "name")
    ) || findValue(row, (k) => k.includes("name"));
  const email = clean(findValue(row, (k) => k.includes("email") || k.includes("mail")));
  const matricNo = clean(
    findValue(row, (k) => k.includes("matric") || k.includes("matno") || k.includes("regno"))
  );
  const department = clean(
    findValue(row, (k) => k.includes("department") || k.includes("dept") || k.includes("course"))
  );
  const level = clean(findValue(row, (k) => k.includes("level") || k.includes("year")));
  const transactionNumber = clean(
    findValue(row, (k) => k.includes("transaction") || k.includes("transact") || k.includes("ref"))
  );

  return {
    invoiceNumber: upperInvoice,
    fullName: clean(fullName) || "Unknown",
    email: (clean(email) || `${upperInvoice.toLowerCase()}@unknown.local`).toLowerCase(),
    matricNo: (clean(matricNo) || upperInvoice).toUpperCase(),
    department: clean(department) || "Computer Engineering",
    level: clean(level) || "100L",
    transactionNumber: clean(transactionNumber) || `TXN-${upperInvoice}`,
  };
};

// Register/update engineering students from the Google Form (single or bulk)
export const registerStudents = async (req, res) => {
  try {
    const token = req.headers["x-api-token"] || req.body?.token;
    if (!process.env.REGISTER_TOKEN || token !== process.env.REGISTER_TOKEN) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const bodyRows = Array.isArray(req.body) ? req.body : req.body?.students;
    const list = Array.isArray(bodyRows) ? bodyRows : [req.body?.student || req.body];

    let registered = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    const errors = [];

    for (const row of list) {
      const data = mapRow(row);
      if (!data) {
        skipped += 1;
        continue;
      }

      try {
        const existing = await Student.findOne({ invoiceNumber: data.invoiceNumber });

        const setFields = { ...data };
        if (existing) {
          // keep previously known values when the new row omits them
          Object.keys(setFields).forEach((key) => {
            if (!setFields[key] && existing[key]) setFields[key] = existing[key];
          });
        }

        await Student.findOneAndUpdate(
          { invoiceNumber: data.invoiceNumber },
          { $set: setFields, $setOnInsert: { discountUsed: false } },
          { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: false }
        );

        if (existing) updated += 1;
        else registered += 1;
      } catch (error) {
        failed += 1;
        errors.push({ invoiceNumber: data.invoiceNumber, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: "Students processed",
      registered,
      updated,
      skipped,
      failed,
      total: list.length,
      errors,
    });
  } catch (error) {
    console.error("Register students error:", error);
    res.status(500).json({ success: false, message: "Failed to register students" });
  }
};

// Send a sample confirmation email (for testing the Gmail setup)
export const sendTestEmail = async (req, res) => {
  const to = req.query.to || req.body?.to || "tunmiseadepitan@gmail.com";

  try {
    const token = req.headers["x-api-token"] || req.body?.token;
    if (!process.env.REGISTER_TOKEN || token !== process.env.REGISTER_TOKEN) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const booking = {
      _id: "test-booking-0001",
      code: "123456",
      name: "Test Guest",
      matricNo: "21/ENG02/029",
      email: to,
      phone: "+2348000000000",
      amount: 12000,
      discountApplied: false,
      createdAt: new Date(),
      seats: [
        { seatNumber: "REGULAR-1-S1", table: { tableNumber: "REGULAR-1" } },
      ],
    };

    await sendHtmlEmail({
      to,
      subject: "FÀÁJÍ LAWA | Your Reservation is Confirmed",
      html: generateEmailTemplate(booking, booking.seats),
    });

    res.status(200).json({
      success: true,
      to,
      diagnostics: {
        brevoKeySet: Boolean(process.env.BREVO_API_KEY),
        sender: process.env.EMAIL_FROM || process.env.GMAIL_EMAIL || "(not set)",
      },
    });
  } catch (error) {
    console.error("Test email error:", error?.response?.data || error);
    res.status(500).json({
      success: false,
      to,
      error: error.message,
      brevoResponse: error.response?.data,
      diagnostics: {
        brevoKeySet: Boolean(process.env.BREVO_API_KEY),
        sender: process.env.EMAIL_FROM || process.env.GMAIL_EMAIL || "(not set)",
      },
    });
  }
};

// Simple sanity check: how many students are registered
export const getStudentCount = async (req, res) => {
  try {
    const token = req.headers["x-api-token"];
    if (!process.env.REGISTER_TOKEN || token !== process.env.REGISTER_TOKEN) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const total = await Student.countDocuments();
    const used = await Student.countDocuments({ discountUsed: true });

    res.status(200).json({ success: true, total, used, available: total - used });
  } catch (error) {
    console.error("Get student count error:", error);
    res.status(500).json({ success: false, message: "Failed to count students" });
  }
};

import dns from "dns";
import fs from "fs";
import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Booking } from "../models/bookingModel.js";
import { Seat } from "../models/seatModel.js";
import "../models/tableModel.js";
import { ActivityLog } from "../models/activityLogModel.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// READ-ONLY. Lists every successful Paystack payment that does not have a
// confirmed booking behind it, and whether the seats it was for are still free.
//
// Usage (PowerShell):
//   $env:PROD_MONGO_URI="mongodb+srv://..."; $env:PAYSTACK_SECRET_KEY="sk_live_..."
//   node utils/reconcilePayments.js [--from 2026-10-09]
//
// Writes reconcile-report.json next to this script's cwd. Changes nothing.

const fromArg = process.argv.indexOf("--from");
const FROM = fromArg > -1 ? process.argv[fromArg + 1] : "2026-10-09";

const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
});

const fetchSuccessfulTransactions = async () => {
  const all = [];
  for (let page = 1; ; page++) {
    const { data } = await paystack.get("/transaction", {
      params: { status: "success", from: FROM, perPage: 100, page },
    });
    all.push(...data.data);
    if (page >= (data.meta?.pageCount || 1)) break;
  }
  return all;
};

const field = (tx, name) =>
  tx.metadata?.custom_fields?.find((f) => f.variable_name === name)?.value || "";

const run = async () => {
  const uri = process.env.PROD_MONGO_URI || process.env.MONGO_URI;
  if (!uri || !process.env.PAYSTACK_SECRET_KEY) {
    console.error("Set PROD_MONGO_URI and PAYSTACK_SECRET_KEY first.");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log(`Connected ${uri.includes("mongodb+srv") ? "(PROD)" : "(local)"}`);

  const txs = await fetchSuccessfulTransactions();
  console.log(`Paystack: ${txs.length} successful transaction(s) since ${FROM}`);

  const rows = [];
  for (const tx of txs) {
    let meta = tx.metadata;
    if (typeof meta === "string") {
      try { meta = JSON.parse(meta); } catch { meta = {}; }
    }
    const bookingId = meta?.bookingId;
    const byRef = await Booking.findOne({ paystackRef: tx.reference }).populate("seats");
    const byId =
      bookingId && mongoose.isValidObjectId(bookingId)
        ? await Booking.findById(bookingId).populate("seats")
        : null;
    const booking = byRef || byId;

    let state;
    if (booking?.status === "confirmed" && booking.paymentVerified) state = "OK";
    else if (booking) state = "PAID_BUT_PENDING"; // verify never ran; cleanup will delete it
    else state = "PAID_BOOKING_DELETED";

    if (state === "OK") continue;

    // Was the deleted booking created/removed? (activity log survives deletion)
    const created = bookingId
      ? await ActivityLog.findOne({ action: "booking_created", "meta.bookingId": bookingId })
      : null;

    const seats = (booking?.seats || []).map((s) => {
      const ownedByThis = String(s.bookedBy || "") === String(booking._id);
      const lockedNow = s.lockedUntil && s.lockedUntil > new Date();
      return {
        seatNumber: s.seatNumber,
        free: ownedByThis || (!s.isBooked && !lockedNow),
        bookedBy: s.bookedBy ? String(s.bookedBy) : null,
      };
    });

    // Has this person since got a confirmed booking (e.g. paid twice)?
    const otherConfirmed = await Booking.find({
      email: (tx.customer?.email || "").toLowerCase(),
      status: "confirmed",
    }).populate("seats");

    rows.push({
      state,
      reference: tx.reference,
      paidAt: tx.paid_at,
      channel: tx.channel,
      amountPaid: tx.amount / 100,
      email: tx.customer?.email,
      name: field({ metadata: meta }, "full_name"),
      matricNo: field({ metadata: meta }, "matric_no"),
      phone: field({ metadata: meta }, "phone"),
      bookingId: bookingId || null,
      bookingCreatedAt: created?.createdAt || booking?.createdAt || null,
      seats, // empty for deleted bookings - the seat list was deleted with them
      otherConfirmedBookings: otherConfirmed.map((b) => ({
        id: String(b._id),
        ref: b.paystackRef,
        seats: b.seats.map((s) => s.seatNumber),
      })),
    });
  }

  // Free inventory by tier, to help place guests whose original seats are unknown
  const freeSeats = await Seat.find({
    isBooked: false,
    isReserved: { $ne: true },
    $or: [{ lockedUntil: null }, { lockedUntil: { $lte: new Date() } }],
  }).populate("table", "type tableNumber pricePerSeat");
  const freeByTier = {};
  for (const s of freeSeats) {
    const t = s.table?.type || "?";
    freeByTier[t] = (freeByTier[t] || 0) + 1;
  }

  const report = { generatedAt: new Date(), from: FROM, affected: rows, freeByTier };
  fs.writeFileSync("reconcile-report.json", JSON.stringify(report, null, 2));

  console.log(`\n${rows.length} paid payment(s) without a confirmed booking:\n`);
  for (const r of rows) {
    console.log(
      `${r.state.padEnd(22)} ${r.reference}  ₦${r.amountPaid}  ${r.email}  ${r.name}  paid ${r.paidAt}` +
        (r.seats.length
          ? `\n    seats: ${r.seats.map((s) => `${s.seatNumber}${s.free ? " (free)" : ` (TAKEN by ${s.bookedBy})`}`).join(", ")}`
          : "\n    seats: unknown (booking deleted)") +
        (r.otherConfirmedBookings.length
          ? `\n    NOTE: already has confirmed booking(s): ${r.otherConfirmedBookings.map((b) => b.seats.join("/")).join("; ")}`
          : "")
    );
  }
  console.log("\nFree seats by tier:", freeByTier);
  console.log("Full report written to reconcile-report.json");

  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e?.response?.data || e);
  process.exit(1);
});

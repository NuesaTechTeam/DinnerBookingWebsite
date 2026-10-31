import dns from "dns";
import crypto from "crypto";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { PromoCode } from "../models/promoCodeModel.js";
import { Booking } from "../models/bookingModel.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Creates (or lists) promo codes. DRY RUN unless --apply.
//
//   node utils/createPromo.js --percent 50 --tiers REGULAR --max-uses 20 --per-booking 2 [--code MYCODE]
//        [--label "Bronze 50% off"] [--expires 2026-11-01T18:00:00Z] [--apply]
//   node utils/createPromo.js --list
//   node utils/createPromo.js --deactivate MYCODE [--apply]
//
// --max-uses is the most seats ALL guests together can get at the discount;
// --per-booking is the most discounted seats in a single booking.
// Without --code a hard-to-guess one is generated.

const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const apply = process.argv.includes("--apply");

// No 0/O/1/I so codes are easy to read out loud
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const randomCode = (prefix) =>
  `${prefix}-${Array.from({ length: 5 }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]).join("")}`;

const run = async () => {
  const uri = process.env.PROD_MONGO_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);
  console.log(`Connected ${uri.includes("mongodb+srv") ? "(PROD)" : "(local)"} - ${apply ? "APPLY" : "DRY RUN"}\n`);

  if (process.argv.includes("--list")) {
    const promos = await PromoCode.find().sort({ createdAt: 1 });
    if (!promos.length) console.log("No promo codes yet.");
    for (const p of promos) {
      const bookings = await Booking.find({ promoCode: p.code, status: { $in: ["pending", "confirmed"] } }, "name status promoSeats");
      const used = bookings.reduce((n, b) => n + (b.promoSeats || 0), 0);
      console.log(
        `${p.code}: ${p.percentOff}% off ${p.tiers.join("/")} | ${used}/${p.maxUses} seats used | max ${p.perBookingMax}/booking | ` +
          `${p.active ? "active" : "INACTIVE"}${p.expiresAt ? ` | expires ${p.expiresAt.toISOString()}` : ""}`
      );
      for (const b of bookings) console.log(`    ${b.name} [${b.status}] ${b.promoSeats} seat(s)`);
    }
    return mongoose.disconnect();
  }

  const off = arg("deactivate");
  if (off) {
    const p = await PromoCode.findOne({ code: off.toUpperCase() });
    if (!p) throw new Error(`No promo code ${off}`);
    console.log(`Would deactivate ${p.code} (${p.percentOff}% off ${p.tiers.join("/")})`);
    if (apply) { await PromoCode.updateOne({ _id: p._id }, { active: false }); console.log("Deactivated - nobody can use it from now on."); }
    else console.log("Dry run only - re-run with --apply.");
    return mongoose.disconnect();
  }

  const percentOff = Number(arg("percent"));
  const tiers = String(arg("tiers") || "").toUpperCase().split(",").map((t) => t.trim()).filter(Boolean);
  const maxUses = Number(arg("max-uses"));
  const perBookingMax = Number(arg("per-booking") || 1);
  const expiresAt = arg("expires") ? new Date(arg("expires")) : undefined;
  if (!(percentOff >= 1 && percentOff <= 100) || !tiers.length || !(maxUses >= 1) || !(perBookingMax >= 1) || (expiresAt && isNaN(expiresAt))) {
    console.error("Usage: node utils/createPromo.js --percent 50 --tiers REGULAR --max-uses 20 --per-booking 2 [--code X] [--label L] [--expires ISO] [--apply]");
    process.exit(1);
  }
  const bad = tiers.filter((t) => !["REGULAR", "VIP", "VVIP"].includes(t));
  if (bad.length) throw new Error(`Unknown tier(s): ${bad.join(", ")} (use REGULAR, VIP, VVIP)`);

  const code = String(arg("code") || randomCode(tiers.length === 1 && tiers[0] === "REGULAR" ? "BRONZE" : "NUESA")).toUpperCase().trim();
  if (await PromoCode.exists({ code })) throw new Error(`Code ${code} already exists`);

  const label = arg("label") || `${percentOff}% off ${tiers.join("/")}`;
  console.log(`Code:            ${code}`);
  console.log(`Discount:        ${percentOff}% off, ${tiers.join("/")} seats only`);
  console.log(`Seat cap:        ${maxUses} discounted seats in total (${perBookingMax} per booking)`);
  console.log(`Expires:         ${expiresAt ? expiresAt.toISOString() : "never (deactivate it when you're done)"}`);
  console.log(`Most it can cost: about ${maxUses} x the ${percentOff}% discount per seat (e.g. ${maxUses} x Bronze 12,000 -> ₦${Math.round(maxUses * 12000 * percentOff / 100).toLocaleString()})`);

  if (!apply) { console.log("\nDry run only - nothing created. Re-run with --apply."); return mongoose.disconnect(); }
  await PromoCode.create({ code, label, percentOff, tiers, maxUses, perBookingMax, expiresAt });
  console.log(`\nCreated. Share this code: ${code}`);
  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error("ERROR:", e.message || e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

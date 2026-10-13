import dns from "dns";
import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Student } from "../models/studentModel.js";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Minimal CSV parser (handles quoted fields + embedded commas/quotes)
const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // ignore
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
};

const clean = (v) => {
  const s = String(v ?? "").trim();
  return s === "" ? undefined : s;
};

const run = async () => {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node utils/syncStudentsFromCsv.js <path-to-csv>");
    process.exit(1);
  }

  const uri = process.env.PROD_MONGO_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);
  console.log(`Connected ${uri.includes("mongodb+srv") ? "(PROD)" : "(local)"}`);

  const rows = parseCsv(fs.readFileSync(file, "utf8"));
  const header = rows[0].map((h) => h.trim().toUpperCase());
  const data = rows.slice(1).filter((r) => r.some((c) => clean(c)));

  const idx = (needle) => header.findIndex((h) => h.includes(needle));
  const iLast = idx("LAST NAME");
  const iFirst = idx("FIRST NAME");
  const iMatric = idx("MATRIC");
  const iDept = idx("DEP");
  const iLevel = idx("LEVEL");
  const iInvoice = idx("INVOICE");
  const iEmail = idx("EMAIL");

  console.log(`Rows: ${data.length}; columns: ${header.join(" | ")}`);

  const existing = new Set(
    (await Student.find({}, "invoiceNumber").lean()).map((s) => s.invoiceNumber)
  );
  console.log(`Existing in DB: ${existing.size}`);

  let added = 0;
  let skippedNoInvoice = 0;
  let skippedExists = 0;
  const addedInvoices = [];

  for (const r of data) {
    const invoice = clean(r[iInvoice]);
    if (!invoice) {
      skippedNoInvoice++;
      continue;
    }
    const invoiceNumber = invoice.toUpperCase();
    if (existing.has(invoiceNumber)) continue;

    const last = clean(r[iLast]) || "";
    const first = clean(iFirst >= 0 ? r[iFirst] : "");
    const fullName = clean(`${first} ${last}`) || clean(last) || `Student ${invoiceNumber}`;

    const doc = {
      invoiceNumber,
      fullName,
      email: (clean(r[iEmail]) || `${invoiceNumber.toLowerCase()}@unknown.local`).toLowerCase(),
      matricNo: (clean(r[iMatric]) || invoiceNumber).toUpperCase(),
      department: clean(r[iDept]) || "Computer Engineering",
      level: clean(r[iLevel]) || "100L",
      transactionNumber: `TXN-${invoiceNumber}`,
      discountUsed: false,
      isActive: true,
    };

    await Student.updateOne(
      { invoiceNumber },
      { $setOnInsert: doc },
      { upsert: true, runValidators: false, setDefaultsOnInsert: true }
    );
    existing.add(invoiceNumber);
    added += 1;
    if (added <= 15 || existing.has("668863")) {
      // no-op; kept for readability
    }
  }

  console.log(`Added: ${added}`);
  console.log(`Skipped (no invoice): ${skippedNoInvoice}`);

  const total = await Student.countDocuments();
  const has = await Student.findOne({ invoiceNumber: "668863" });
  console.log(`DB total now: ${total}`);
  console.log(`668863 present: ${Boolean(has)}${has ? ` (${has.fullName})` : ""}`);

  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Student } from "../models/studentModel.js";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const col = mongoose.connection.db.collection("students");

  const indexes = await col.indexes();
  for (const idx of indexes) {
    const shouldDrop =
      (idx.name === "matricNo_1" || idx.name === "transactionNumber_1") &&
      idx.unique;
    if (shouldDrop) {
      await col.dropIndex(idx.name);
      console.log("Dropped unique index:", idx.name);
    }
  }

  await col.createIndex({ matricNo: 1 }, { name: "matricNo_1" });
  await col.createIndex(
    { transactionNumber: 1 },
    { name: "transactionNumber_1" }
  );
  console.log("Ensured non-unique indexes on matricNo and transactionNumber");

  const total = await Student.countDocuments();
  console.log("Total students:", total);

  const depts = await Student.aggregate([
    { $group: { _id: "$department", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  console.log("Departments:", JSON.stringify(depts));

  const levels = await Student.aggregate([
    { $group: { _id: "$level", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  console.log("Levels:", JSON.stringify(levels));

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

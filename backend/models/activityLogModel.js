import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    details: {
      type: String,
      default: "",
    },
    meta: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

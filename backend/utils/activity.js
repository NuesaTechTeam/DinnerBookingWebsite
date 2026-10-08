import { ActivityLog } from "../models/activityLogModel.js";

// Fire-and-forget activity logging (never breaks the main request)
export const logActivity = async (action, details = "", meta = {}) => {
  try {
    await ActivityLog.create({ action, details, meta });
  } catch (error) {
    console.error("Activity log error:", error.message);
  }
};

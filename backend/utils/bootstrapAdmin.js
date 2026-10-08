import { AdminUser } from "../models/adminUserModel.js";
import { logActivity } from "./activity.js";

// One-time bootstrap: creates the first super admin from env vars if no
// admin accounts exist yet. Afterwards all users are managed from the
// dashboard (POST /admin/users), never from env/hardcoded credentials.
export const ensureBootstrapAdmin = async () => {
  try {
    const count = await AdminUser.countDocuments();
    if (count > 0) return;

    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
      console.warn(
        "No admin accounts exist and ADMIN_USERNAME/ADMIN_PASSWORD are not set - admin login will stay disabled until an account is created"
      );
      return;
    }

    const bcrypt = await import("bcrypt");
    const passwordHash = await bcrypt.hash(password, 12);

    await AdminUser.create({
      username,
      passwordHash,
      role: "super",
      isActive: true,
    });

    await logActivity(
      "admin_user_seeded",
      `Bootstrap super admin "${username}" created from environment variables`
    );
    console.log(`Bootstrap admin account created: ${username}`);
  } catch (error) {
    console.error("Admin bootstrap error:", error);
  }
};

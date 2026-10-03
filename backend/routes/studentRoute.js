import express from "express";
import {
  registerStudents,
  getStudentCount,
  sendTestEmail,
} from "../controllers/studentController.js";

const router = express.Router();

router.post("/register", registerStudents);
router.get("/count", getStudentCount);
router.post("/test-email", sendTestEmail);

export default router;

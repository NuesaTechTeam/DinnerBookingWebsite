import express from "express";
import { registerStudents, getStudentCount } from "../controllers/studentController.js";

const router = express.Router();

router.post("/register", registerStudents);
router.get("/count", getStudentCount);

export default router;

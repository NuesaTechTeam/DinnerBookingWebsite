import express from "express"
import { verifyEngineeringStudent } from "../controllers/discountController.js"

const router = express.Router()

router.post("/verify", verifyEngineeringStudent)

export default router
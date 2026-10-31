import express from "express"
import { verifyEngineeringStudent, verifyPromo } from "../controllers/discountController.js"

const router = express.Router()

router.post("/verify", verifyEngineeringStudent)
router.post("/verify-promo", verifyPromo)

export default router
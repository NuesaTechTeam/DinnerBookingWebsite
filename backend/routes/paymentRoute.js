import express from "express"
import { verifyPayment, paystackWebhook } from "../controllers/paymentController.js"

const router = express.Router()

router.post("/verify", verifyPayment)
router.post("/webhook", paystackWebhook)

export default router

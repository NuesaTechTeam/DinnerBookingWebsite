import express from "express"
import { verifyPayment, paystackWebhook } from "../controllers/paymentController.js"
import { startTopUp, verifyTopUp } from "../controllers/topUpController.js"

const router = express.Router()

router.post("/verify", verifyPayment)
router.post("/webhook", paystackWebhook)
router.post("/topup", startTopUp)
router.post("/topup/verify", verifyTopUp)

export default router

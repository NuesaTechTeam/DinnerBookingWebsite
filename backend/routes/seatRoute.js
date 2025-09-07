import express from "express"
import { getSeats, getAvailableSeats, getSeatStatus, getSeatsByTable } from "../controllers/seatController.js"

const router = express.Router()

router.get("/", getSeats);
router.get("/available", getAvailableSeats);
router.get("/table/:tableId", getSeatsByTable);
router.post("/status", getSeatStatus);


export default router
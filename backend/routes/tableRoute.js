import express from "express"
import { getTables, getTable, getTablesByType } from "../controllers/tableController.js"

const router = express.Router()

router.get("/", getTables)
router.get("/:id", getTable)
router.get("/type/:type", getTablesByType)

export default router
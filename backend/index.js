import express from "express"
import http from "http"
import cors from "cors"
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import logger from "./middlewares/logger.js";
import errorHandler from "./middlewares/errorhandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import bookingRoute from "./routes/bookingRoute.js"
import paymentRoute from "./routes/paymentRoute.js"
import seatRoute from "./routes/seatRoute.js"
import tableRoute from "./routes/tableRoute.js"
import { cleanupExpiredLocks } from "./controllers/bookingController.js";
import initializeDatabase from "./utils/initializeDB.js";
import syncExistingTables from "./utils/syncExistingTables.js";


//Load env vars
dotenv.config();

export const app = express();
const port = process.env.PORT || 5000;

// if (!process.env.FRONTEND_URL) {
//   console.error("Missing FRONTEND_URL in .env");
//   process.exit(1);
// }

//middleware
app.use(apiLimiter);
app.use(express.json());
app.use(cors());
app.use(logger);

//api creation
app.get("/", (req, res) => {
  res.send("Express app is running");
});


connectDB(); 

// initializeDatabase()
// await syncExistingTables()

//routes
app.use("/booking", bookingRoute)
app.use("/payment", paymentRoute)
app.use("/seat", seatRoute)
app.use("/table", tableRoute)

app.use(errorHandler);

app.listen(port, (error) => {
  if (!error) {
    console.log("server is running on port", port);
  } else {
    console.log("Error :", error);
  }
});

//Run cleanup on server start
cleanupExpiredLocks()

//Then run every 10 minutes
setInterval(cleanupExpiredLocks, 10 * 60 * 1000);
console.log("Seat lock cleanup scheduled to run every 10 minutes");

process.on("unhandledRejection", (reason, promise) => {
  console.log(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  app.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.log(`Uncaught Exception: ${error.message}`);
  app.close(() => process.exit(1));
});
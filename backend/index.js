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
import discountRoute from "./routes/discountRoute.js"
import studentRoute from "./routes/studentRoute.js"
import adminRoute from "./routes/adminRoute.js"
import { cleanupExpiredLocks } from "./controllers/bookingController.js";
import initializeDatabase from "./utils/initializeDB.js";
import syncExistingTables from "./utils/syncExistingTables.js";
import { ensureBootstrapAdmin } from "./utils/bootstrapAdmin.js";


//Load env vars
dotenv.config();

export const app = express();
const port = process.env.PORT || 5000;

// if (!process.env.FRONTEND_URL) {
//   console.error("Missing FRONTEND_URL in .env");
//   process.exit(1);
// }

const staticOrigins = [
  "https://dinner.nuesaabuad.ng",
  "https://www.nuesaabuad.ng",
  "https://nuesaabuad.ng",
  "https://nuesadinner.onrender.com",
  "https://dinnerbookingwebsite.nasurf25.workers.dev",
  "http://localhost:5173",
];

// Extra origins can be added without a code change: FRONTEND_URLS=origin1,origin2
const envOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const allowedOrigins = [...staticOrigins, ...envOrigins];

// Allow the known origins plus any subdomain of nuesaabuad.ng / workers.dev
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // non-browser requests (curl, mobile apps)
  if (allowedOrigins.includes(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.nuesaabuad\.ng$/i.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.workers\.dev$/i.test(origin)) return true;
  return false;
};

//middleware
app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);
const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "x-api-token"],
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
};

// CORS must run before the rate limiter so that EVERY response - including
// rate-limited (429) and error responses - still carries CORS headers.
// Otherwise the browser reports a misleading "No Access-Control-Allow-Origin".
app.use(cors(corsOptions));
app.use(apiLimiter);
app.use(express.json());
app.use(logger);

//api creation
app.get("/", (req, res) => {
  res.send("Express app is running");
});


await connectDB(); 

// Create the first super admin from env vars if no admin accounts exist yet
await ensureBootstrapAdmin();

// await initializeDatabase()
// await syncExistingTables()

//routes
app.use("/booking", bookingRoute)
app.use("/payment", paymentRoute)
app.use("/seat", seatRoute)
app.use("/table", tableRoute)
app.use("/discount", discountRoute)
app.use("/student", studentRoute)
app.use("/admin", adminRoute)

app.use(errorHandler);

const server = app.listen(port, (error) => {
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
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.log(`Uncaught Exception: ${error.message}`);
  server.close(() => process.exit(1));
});
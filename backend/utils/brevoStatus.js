import axios from "axios";
import { Booking } from "../models/bookingModel.js";

// Reads Brevo's transactional log and account plan so the admin dashboard can
// show which tickets actually reached guests and how many sends are left.

const brevo = () =>
  axios.create({
    baseURL: "https://api.brevo.com/v3",
    headers: { "api-key": process.env.BREVO_API_KEY, accept: "application/json" },
    timeout: 20000,
  });

const DELIVERED = ["delivered", "opened", "uniqueOpened", "clicks", "loadedByProxy"];
const FAILED = ["hardBounces", "softBounces", "blocked", "invalid", "error", "spam"];

let cache = { at: 0, data: null };
const CACHE_MS = 60 * 1000;

const fetchEvents = async (days = 30) => {
  const events = [];
  for (let offset = 0; offset < 50000; offset += 2500) {
    const { data } = await brevo().get("/smtp/statistics/events", {
      params: { days, limit: 2500, offset, sort: "desc" },
    });
    const batch = data.events || [];
    events.push(...batch);
    if (batch.length < 2500) break;
  }
  return events;
};

// Remaining sending allowance, straight from the Brevo account
const fetchPlan = async () => {
  const { data } = await brevo().get("/account");
  const plans = data.plan || [];
  const sendPlan =
    plans.find((p) => p.creditsType === "sendLimit") || plans[0] || {};
  return {
    type: sendPlan.type || "unknown",
    creditsLeft: typeof sendPlan.credits === "number" ? sendPlan.credits : null,
    creditsType: sendPlan.creditsType || "",
    // Brevo's free plan resets daily; paid plans reset monthly
    resets: sendPlan.type === "free" ? "daily" : "monthly",
  };
};

const fetchSentThisMonth = async () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const ymd = (d) => d.toISOString().slice(0, 10);
  const { data } = await brevo().get("/smtp/statistics/aggregatedReport", {
    params: { startDate: ymd(start), endDate: ymd(now) },
  });
  return data.requests ?? null;
};

// Pull Brevo's view of every confirmed booking's ticket and store any upgrade
// (sent -> delivered, or failed) on the booking. Returns the dashboard payload.
export const getEmailOverview = async ({ force = false } = {}) => {
  if (!force && cache.data && Date.now() - cache.at < CACHE_MS) return cache.data;

  const brevoInfo = { ok: true, error: "", plan: null, sentThisMonth: null };
  let events = [];
  try {
    [events, brevoInfo.plan, brevoInfo.sentThisMonth] = await Promise.all([
      fetchEvents(),
      fetchPlan(),
      fetchSentThisMonth().catch(() => null),
    ]);
  } catch (error) {
    brevoInfo.ok = false;
    brevoInfo.error =
      error.response?.data?.message || error.message || "Brevo unreachable";
  }

  const bookings = await Booking.find({ status: "confirmed" })
    .populate({ path: "seats", populate: { path: "table", model: "Table" } })
    .sort({ createdAt: -1 });

  const list = [];
  for (const b of bookings) {
    // Ticket subjects end in "(#<entry code>)" - see confirmationSubject
    const ref = b.code || String(b._id).slice(-8).toUpperCase();
    // A re-sent ticket (e.g. after a seat move) has the same subject as the
    // old one, so only count events from the latest attempt onwards - an old
    // delivery must never hide a newer send that failed.
    const since = b.emailLastAttemptAt
      ? b.emailLastAttemptAt.getTime() - 2 * 60 * 1000
      : 0;
    const mine = events.filter(
      (ev) =>
        (ev.email || "").toLowerCase() === b.email &&
        (ev.subject || "").includes(`(#${ref})`) &&
        new Date(ev.date).getTime() >= since
    );
    const kinds = new Set(mine.map((ev) => ev.event));
    const last = mine[0];

    let status = b.emailStatus || "not_sent";
    if ([...kinds].some((k) => DELIVERED.includes(k))) status = "delivered";
    else if ([...kinds].some((k) => FAILED.includes(k))) status = "failed";
    else if (kinds.size > 0 && status === "not_sent") status = "sent";

    // Only trust Brevo's view when it was actually read. Bookings made before
    // tracking existed have no stored status yet - store Brevo's verdict so the
    // ticket retry job can pick up any that never reached the guest.
    const unstored = b.$isDefault("emailStatus");
    if (brevoInfo.ok && (status !== b.emailStatus || unstored)) {
      await Booking.updateOne(
        { _id: b._id },
        { emailStatus: status },
        { timestamps: false }
      );
    }

    list.push({
      _id: b._id,
      code: b.code,
      name: b.name,
      email: b.email,
      phone: b.phone,
      seats: (b.seats || []).map((s) => s.seatNumber),
      createdAt: b.createdAt,
      emailStatus: status,
      emailSentAt: b.emailSentAt || last?.date || null,
      lastEvent: last ? `${last.event}${last.reason ? `: ${last.reason}` : ""}` : "",
      emailError: b.emailError || "",
      complimentary: !!b.complimentary,
      entryPass: !!b.entryPass,
      passCount: b.passCount || 0,
    });
  }

  // Everyone with a ticket is listed and tracked; "people"/"seats" count
  // paid bookings only, complimentary ones are counted separately.
  const count = (s) => list.filter((r) => r.emailStatus === s).length;
  const paid = list.filter((r) => !r.complimentary);
  const comp = list.filter((r) => r.complimentary);
  const data = {
    summary: {
      people: paid.length,
      seats: paid.reduce((n, r) => n + r.seats.length, 0),
      compPeople: comp.length,
      compSeats: comp.reduce((n, r) => n + r.seats.length, 0),
      tickets: list.length,
      delivered: count("delivered"),
      sent: count("sent"),
      failed: count("failed"),
      notSent: count("not_sent"),
    },
    brevo: brevoInfo,
    list,
    syncedAt: new Date(),
  };
  cache = { at: Date.now(), data };
  return data;
};

export const clearEmailOverviewCache = () => {
  cache = { at: 0, data: null };
};

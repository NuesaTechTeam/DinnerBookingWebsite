import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import {
  LogOut,
  RefreshCw,
  Search,
  Users,
  Wallet,
  Armchair,
  TicketCheck,
  Clock,
  Activity as ActivityIcon,
  CheckCircle,
  QrCode,
  ScanLine,
  Camera,
  X,
} from "lucide-react";
import AdminAPI from "../utils/endpoints/adminApi.js";
import logo from "../assets/logo.png";

const TOKEN_KEY = "nuesa_admin_token";
const PROFILE_KEY = "nuesa_admin_profile";

const naira = (value) => `₦${Number(value || 0).toLocaleString()}`;

const fmtDate = (value) => {
  const d = new Date(value);
  return d.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const tableLabel = (tableNumber) => {
  const parts = String(tableNumber || "").split("-");
  return parts[parts.length - 1];
};

const seatLabel = (seatNumber) => {
  const match = String(seatNumber || "").match(/S(\d+)$/);
  return match ? match[1] : seatNumber;
};

const STATUS_STYLES = {
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/40",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/40",
  cancelled: "bg-gray-500/10 text-gray-400 border-gray-600/40",
};

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await AdminAPI.login({ username, password });
      if (res.success && res.token) {
        onLogin({ token: res.token, admin: res.admin, role: res.role });
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)]"
      >
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Logo" className="w-14 h-14 object-contain mb-3" />
          <h1 className="text-2xl font-serif font-extrabold text-[#d4af37] tracking-widest uppercase">
            FÀÁJÍ LAWA
          </h1>
          <p className="text-[10px] text-gray-400 tracking-[0.25em] uppercase mt-1">
            Admin Control Panel
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-[11px] font-medium uppercase tracking-wider block mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#d4af37] outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-gray-400 text-[11px] font-medium uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#d4af37] outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-800 text-red-300 p-3 rounded-lg text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] text-black font-extrabold py-3 rounded-lg text-xs uppercase tracking-widest hover:brightness-110 disabled:opacity-60 transition-all cursor-pointer"
          >
            {busy ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </Motion.div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-5">
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30">
        <Icon size={16} className="text-[#d4af37]" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 tracking-widest uppercase truncate">
          {label}
        </p>
        <p className="text-xl font-serif font-bold text-white truncate">
          {value}
        </p>
        {sub && <p className="text-[10px] text-gray-500 truncate">{sub}</p>}
      </div>
    </div>
  </div>
);

const TeamAccess = ({ token, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "admin",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await AdminAPI.getUsers(token);
      setUsers(res.data || []);
      setMsg(null);
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout();
        return;
      }
      setMsg({
        success: false,
        message:
          err.response?.data?.message || err.message || "Failed to load users",
      });
    } finally {
      setLoading(false);
    }
  }, [token, onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await AdminAPI.createUser(token, form);
      if (res.success) {
        setMsg({
          success: true,
          message: `Account "${res.data.username}" created`,
        });
        setForm({ username: "", password: "", role: "admin" });
        await load();
      } else {
        setMsg({ success: false, message: res.message });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout();
        return;
      }
      setMsg({
        success: false,
        message: err.response?.data?.message || "Failed to create user",
      });
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (user) => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await AdminAPI.updateUser(token, user._id, {
        isActive: !user.isActive,
      });
      if (res.success) {
        setMsg({
          success: true,
          message: `${res.data.username} ${
            res.data.isActive ? "activated" : "deactivated"
          }`,
        });
        await load();
      } else {
        setMsg({ success: false, message: res.message });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout();
        return;
      }
      setMsg({
        success: false,
        message: err.response?.data?.message || "Failed to update user",
      });
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (user) => {
    const next = window.prompt(
      `New password for "${user.username}" (min 8 characters):`,
      ""
    );
    if (!next) return;

    setBusy(true);
    setMsg(null);
    try {
      const res = await AdminAPI.updateUser(token, user._id, {
        password: next,
      });
      if (res.success) {
        setMsg({
          success: true,
          message: `Password updated for ${res.data.username}`,
        });
      } else {
        setMsg({ success: false, message: res.message });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout();
        return;
      }
      setMsg({
        success: false,
        message: err.response?.data?.message || "Failed to update password",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-gray-800">
        <h2 className="text-sm font-bold tracking-widest text-[#d4af37] uppercase">
          Team Access ({users.length})
        </h2>
        <p className="text-[11px] text-gray-500 mt-1">
          Accounts that can sign in to this dashboard. Only super admins can
          manage accounts.
        </p>
      </div>

      {msg && (
        <div
          className={`mx-4 sm:mx-5 mt-4 p-3 rounded-lg text-xs border ${
            msg.success
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
              : "bg-red-950/40 border-red-800 text-red-300"
          }`}
        >
          {msg.message}
        </div>
      )}

      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Existing accounts */}
        <div className="space-y-2">
          {loading ? (
            <p className="text-gray-500 text-xs">Loading accounts...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-500 text-xs">No accounts yet.</p>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                className="flex flex-wrap items-center justify-between gap-3 border border-gray-800 rounded-xl px-4 py-3 bg-black/30"
              >
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {u.username}
                    <span
                      className={`ml-2 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        u.role === "super"
                          ? "border-[#d4af37]/50 text-[#d4af37] bg-[#d4af37]/10"
                          : "border-gray-600 text-gray-400"
                      }`}
                    >
                      {u.role}
                    </span>
                    {!u.isActive && (
                      <span className="ml-2 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border border-red-700 text-red-400 bg-red-950/40">
                        inactive
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {u.lastLoginAt
                      ? `Last login ${fmtDate(u.lastLoginAt)}`
                      : "Never signed in"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => resetPassword(u)}
                    disabled={busy}
                    className="text-[10px] uppercase tracking-wider border border-gray-700 text-gray-300 hover:border-[#d4af37] hover:text-[#d4af37] px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Reset pw
                  </button>
                  <button
                    onClick={() => toggleActive(u)}
                    disabled={busy}
                    className={`text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50 cursor-pointer ${
                      u.isActive
                        ? "border-red-800 text-red-400 hover:bg-red-950/50"
                        : "border-emerald-800 text-emerald-400 hover:bg-emerald-950/50"
                    }`}
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create account */}
        <form onSubmit={submit} className="space-y-3">
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">
            Add account
          </p>
          <div>
            <label className="text-gray-400 text-[11px] font-medium uppercase tracking-wider block mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
              required
              minLength={3}
              maxLength={24}
              pattern="[a-zA-Z0-9_.\-]{3,24}"
              title="3-24 characters: letters, numbers, dot, underscore, dash"
              className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#d4af37] outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-gray-400 text-[11px] font-medium uppercase tracking-wider block mb-1.5">
              Password (min 8 characters)
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#d4af37] outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-gray-400 text-[11px] font-medium uppercase tracking-wider block mb-1.5">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({ ...f, role: e.target.value }))
              }
              className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#d4af37] outline-none transition-colors"
            >
              <option value="admin">Admin - view & check in only</option>
              <option value="super">Super admin - manage accounts</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] text-black font-extrabold py-2.5 rounded-lg text-xs uppercase tracking-widest hover:brightness-110 disabled:opacity-60 transition-all cursor-pointer"
          >
            {busy ? "Working..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
};

const CheckInStation = ({ token, onLogout, onCheckedIn }) => {
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState("");
  const [status, setStatus] = useState(null);
  const [booking, setBooking] = useState(null);
  const [busySeat, setBusySeat] = useState({});
  const [lastCode, setLastCode] = useState("");
  const scannerRef = useRef(null);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      try {
        await scanner.stop();
        scanner.clear();
      } catch {}
    }
    setScanning(false);
  }, []);

  useEffect(() => () => stopScanner(), [stopScanner]);

  const resolve = useCallback(
    async (raw) => {
      const code = String(raw || "").trim();
      if (!code) return;
      setLastCode(code);
      setStatus({ type: "info", message: "Looking up booking..." });
      try {
        const res = await AdminAPI.lookupBooking(token, code);
        setBooking(res.data);
        setStatus({
          type: "success",
          message: `Found booking for ${res.data?.name || "guest"}`,
        });
      } catch (err) {
        if (err.response?.status === 401) {
          onLogout();
          return;
        }
        setBooking(null);
        setStatus({
          type: "error",
          message:
            err.response?.data?.message ||
            "No booking found for that code. Check the ticket and try again.",
        });
      }
    },
    [token, onLogout]
  );

  const startScanner = useCallback(async () => {
    setStatus(null);
    setBooking(null);
    setScanning(true);
    try {
      // html5-qrcode JSON-parses its persisted settings with no try/catch.
      // A corrupt value (e.g. the literal string "null") crashes the scanner
      // with "Unexpected token ... is not valid JSON". Reset it if unparseable.
      try {
        const raw = localStorage.getItem("HTML5_QRCODE_DATA");
        if (raw) JSON.parse(raw);
      } catch {
        localStorage.removeItem("HTML5_QRCODE_DATA");
      }
      const { Html5Qrcode } = await import("html5-qrcode");
      await new Promise((resolve) => setTimeout(resolve, 60));
      const scanner = new Html5Qrcode("qr-reader-region", { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          await stopScanner();
          resolve(decodedText);
        },
        () => {}
      );
    } catch (err) {
      await stopScanner();
      setStatus({
        type: "error",
        message:
          "Camera unavailable or permission denied. Use the manual code entry below.",
      });
    }
  }, [resolve, stopScanner]);

  const handleSeat = async (seatId) => {
    if (!booking) return;
    setBusySeat((prev) => ({ ...prev, [seatId]: true }));
    try {
      await AdminAPI.markSeat(token, booking._id, seatId);
      await resolve(lastCode);
      onCheckedIn?.();
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout();
        return;
      }
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Check-in failed",
      });
    } finally {
      setBusySeat((prev) => ({ ...prev, [seatId]: false }));
    }
  };

  const handleAll = async () => {
    if (!booking) return;
    setBusySeat((prev) => ({ ...prev, ALL: true }));
    try {
      await AdminAPI.checkInBooking(token, booking._id);
      await resolve(lastCode);
      onCheckedIn?.();
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout();
        return;
      }
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Check-in failed",
      });
    } finally {
      setBusySeat((prev) => ({ ...prev, ALL: false }));
    }
  };

  const seats = booking?.seats || [];
  const remaining = seats.filter((s) => !s.isGivenTicket);

  return (
    <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center gap-3">
        <QrCode size={18} className="text-[#d4af37]" />
        <div>
          <h2 className="text-sm font-bold tracking-widest text-[#d4af37] uppercase">
            Check-in Station
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Scan the guest ticket QR code, or type the 6-digit code from their
            email.
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={startScanner}
              disabled={scanning}
              className="flex items-center gap-2 bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] text-black font-extrabold px-4 py-2.5 rounded-lg text-xs uppercase tracking-widest hover:brightness-110 disabled:opacity-60 transition-all cursor-pointer"
            >
              <Camera size={14} /> {scanning ? "Camera on" : "Scan QR code"}
            </button>
            {scanning && (
              <button
                onClick={stopScanner}
                className="flex items-center gap-2 border border-gray-700 text-gray-300 px-4 py-2.5 rounded-lg text-xs uppercase tracking-widest hover:border-red-700 hover:text-red-400 transition-colors cursor-pointer"
              >
                <X size={14} /> Stop
              </button>
            )}
          </div>

          <div id="qr-reader-region" className="rounded-xl overflow-hidden bg-black/60 border border-gray-800 min-h-[120px]" />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manual.trim()) resolve(manual);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="6-digit code, booking id, or ticket link"
              className="flex-1 bg-black/60 border border-gray-800 rounded-lg px-3 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 border border-gray-700 hover:border-[#d4af37] text-gray-300 hover:text-[#d4af37] px-3 py-2.5 rounded-lg text-xs uppercase tracking-widest transition-colors cursor-pointer"
            >
              <Search size={13} /> Find
            </button>
          </form>

          {status && (
            <p
              className={`text-xs rounded-lg px-3 py-2 border ${
                status.type === "error"
                  ? "bg-red-950/40 border-red-800 text-red-300"
                  : status.type === "success"
                  ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                  : "bg-black/40 border-gray-800 text-gray-400"
              }`}
            >
              {status.message}
            </p>
          )}
        </div>

        <div className="border border-gray-800 rounded-xl p-4 bg-black/30">
          {!booking ? (
            <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center text-gray-600">
              <ScanLine size={28} className="mb-2" />
              <p className="text-xs">
                No booking loaded. Scan a QR code or enter a code to begin.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-white font-semibold text-sm">
                  {booking.name}
                  <span
                    className={`ml-2 inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                      STATUS_STYLES[booking.status] || STATUS_STYLES.cancelled
                    }`}
                  >
                    {booking.status}
                  </span>
                </p>
                <p className="text-gray-400 text-[11px]">{booking.email}</p>
                <p className="text-gray-500 text-[10px]">
                  {booking.matricNo} · {booking.phone}
                </p>
                <p className="text-gray-500 text-[10px] mt-1">
                  Ticket ref: {String(booking._id).slice(-8)} ·{" "}
                  {naira(booking.totalAmount)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {seats.map((seat) => {
                  const label = `T${
                    seat.table?.tableNumber
                      ? tableLabel(seat.table.tableNumber)
                      : "?"
                  }·S${seatLabel(seat.seatNumber)}`;
                  const attended = !!seat.isGivenTicket;
                  return attended ? (
                    <span
                      key={seat._id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold"
                    >
                      <CheckCircle size={10} /> {label}
                    </span>
                  ) : (
                    <button
                      key={seat._id}
                      onClick={() => handleSeat(seat._id)}
                      disabled={busySeat[seat._id] || booking.status !== "confirmed"}
                      title={
                        booking.status === "confirmed"
                          ? `Check in ${label}`
                          : "Only confirmed bookings can be checked in"
                      }
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-gray-600 bg-black/40 text-gray-300 text-[10px] font-semibold hover:border-[#d4af37] hover:text-[#d4af37] disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {busySeat[seat._id] ? "..." : `${label} +`}
                    </button>
                  );
                })}
                {seats.length === 0 && (
                  <span className="text-gray-500 text-xs">No seats</span>
                )}
              </div>

              {booking.status === "confirmed" && remaining.length > 0 && (
                <button
                  onClick={handleAll}
                  disabled={busySeat.ALL}
                  className="w-full inline-flex items-center justify-center px-3 py-2 rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider hover:bg-[#d4af37]/20 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {busySeat.ALL ? "Checking in..." : "Check in all seats"}
                </button>
              )}

              {booking.status === "confirmed" && remaining.length === 0 && (
                <p className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1.5">
                  <CheckCircle size={13} /> All seats checked in
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ token, role, admin, onLogout }) => {  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lastSync, setLastSync] = useState(null);
  const [checkingIn, setCheckingIn] = useState({});
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [actionMsg, setActionMsg] = useState(null);

  const loadAll = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError("");
      try {
        const [statsRes, bookingsRes, activityRes] = await Promise.all([
          AdminAPI.getStats(token),
          AdminAPI.getBookings(token),
          AdminAPI.getActivity(token, 60),
        ]);
        setStats(statsRes.data);
        setBookings(bookingsRes.data || []);
        setActivity(activityRes.data || []);
        setLastSync(new Date());
      } catch (err) {
        if (err.response?.status === 401) {
          onLogout();
          return;
        }
        setError(
          err.response?.data?.message || err.message || "Failed to load data"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, onLogout]
  );

  useEffect(() => {
    loadAll();
    const interval = setInterval(() => loadAll(true), 60000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const shortRef = q.replace(/^#/, "");
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (!q) return true;
      if (
        String(b._id).includes(shortRef) ||
        String(b._id).slice(-8).toLowerCase().includes(shortRef)
      ) {
        return true;
      }
      return [b.name, b.email, b.matricNo, b.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [bookings, query, statusFilter]);

  const checkInSeat = async (bookingId, seatId) => {
    setActionError("");
    setCheckingIn((prev) => ({ ...prev, [seatId]: true }));
    try {
      await AdminAPI.markSeat(token, bookingId, seatId);
      await loadAll(true);
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout();
        return;
      }
      setActionError(
        err.response?.data?.message || err.message || "Check-in failed"
      );
    } finally {
      setCheckingIn((prev) => ({ ...prev, [seatId]: false }));
    }
  };

  const checkInAll = async (bookingId) => {
    setActionError("");
    setCheckingIn((prev) => ({ ...prev, [bookingId]: true }));
    try {
      await AdminAPI.checkInBooking(token, bookingId);
      await loadAll(true);
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout();
        return;
      }
      setActionError(
        err.response?.data?.message || err.message || "Check-in failed"
      );
    } finally {
      setCheckingIn((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#d4af37]">
        <RefreshCw className="animate-spin mr-3" size={22} /> Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-black/85 backdrop-blur-md px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-9 h-9 object-contain" />
          <div>
            <h1 className="text-lg sm:text-xl font-serif font-extrabold text-[#d4af37] tracking-widest uppercase leading-none">
              FÀÁJÍ LAWA
            </h1>
            <span className="text-[9px] text-gray-400 tracking-[0.25em] uppercase">
              Admin Dashboard · {admin || "signed in"}
              {role ? ` · ${role}` : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {lastSync && (
            <span className="hidden sm:block text-[10px] text-gray-500">
              Synced {fmtDate(lastSync)}
            </span>
          )}
          <button
            onClick={() => loadAll(true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-xs border border-gray-700 hover:border-[#d4af37] text-gray-300 hover:text-[#d4af37] px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-xs bg-[#d4af37]/10 border border-[#d4af37]/40 text-[#d4af37] px-3 py-2 rounded-lg hover:bg-[#d4af37]/20 transition-colors cursor-pointer"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {error && (
          <div className="bg-red-950/40 border border-red-800 text-red-300 p-3 rounded-lg text-xs">
            {error}
          </div>
        )}

        {actionError && (
          <div className="bg-red-950/40 border border-red-800 text-red-300 p-3 rounded-lg text-xs flex items-center justify-between gap-3">
            <span>{actionError}</span>
            <button
              onClick={() => setActionError("")}
              className="text-red-400 hover:text-white cursor-pointer"
            >
              dismiss
            </button>
          </div>
        )}

        {/* QR check-in station */}
        <CheckInStation
          token={token}
          onLogout={onLogout}
          onCheckedIn={() => loadAll(true)}
        />

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            icon={Users}
            label="Bookings"
            value={stats?.totalBookings ?? 0}
            sub={`${stats?.pending ?? 0} awaiting payment`}
          />
          <StatCard
            icon={TicketCheck}
            label="Confirmed"
            value={stats?.confirmed ?? 0}
            sub={`${stats?.cancelled ?? 0} cancelled`}
          />
          <StatCard
            icon={Wallet}
            label="Revenue"
            value={naira(stats?.revenue ?? 0)}
            sub="paid bookings"
          />
          <StatCard
            icon={Armchair}
            label="Seats Sold"
            value={stats?.seatsSold ?? 0}
            sub={`G ${stats?.seatsByTier?.VIP ?? 0} · B ${
              stats?.seatsByTier?.REGULAR ?? 0
            }`}
          />
          <StatCard
            icon={Clock}
            label="Checked In"
            value={stats?.checkedIn ?? 0}
            sub="verified arrivals"
          />
          <StatCard
            icon={ActivityIcon}
            label="Discounts"
            value={stats?.discountsUsed ?? 0}
            sub={`${stats?.students ?? 0} students verified`}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Bookings table */}
          <div className="xl:col-span-2 bg-[#0a0a0a] border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-bold tracking-widest text-[#d4af37] uppercase">
                Reservations ({filtered.length})
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search name, matric, email..."
                    className="bg-black/60 border border-gray-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none w-44 sm:w-56"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-black/60 border border-gray-800 rounded-lg px-2 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                >
                  <option value="all">All</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#0d0d0d] text-gray-400 uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Seats / Check-in</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Booked At</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No reservations found.
                      </td>
                    </tr>
                  )}
                  {filtered.map((b) => (
                    <tr
                      key={b._id}
                      className="border-t border-gray-800/70 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <p className="text-white font-semibold">{b.name}</p>
                        <p className="text-gray-400 text-[11px]">{b.email}</p>
                        <p className="text-gray-500 text-[10px]">
                          {b.matricNo} · {b.phone}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(b.seats || []).map((seat) => {
                            const label = `T${
                              seat.table?.tableNumber
                                ? tableLabel(seat.table.tableNumber)
                                : "?"
                            }·S${seatLabel(seat.seatNumber)}`;
                            const attended = !!seat.isGivenTicket;

                            if (attended) {
                              return (
                                <span
                                  key={seat._id}
                                  title="Checked in"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold"
                                >
                                  <CheckCircle size={10} />
                                  {label}
                                </span>
                              );
                            }

                            return (
                              <button
                                key={seat._id}
                                onClick={() => checkInSeat(b._id, seat._id)}
                                disabled={
                                  checkingIn[seat._id] || b.status !== "confirmed"
                                }
                                title={
                                  b.status === "confirmed"
                                    ? `Check in ${label}`
                                    : "Only confirmed bookings can be checked in"
                                }
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-gray-600 bg-black/40 text-gray-300 text-[10px] font-semibold hover:border-[#d4af37] hover:text-[#d4af37] disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer"
                              >
                                {checkingIn[seat._id] ? "..." : `${label} +`}
                              </button>
                            );
                          })}

                          {(b.seats || []).length === 0 && (
                            <span className="text-gray-500">—</span>
                          )}

                          {b.status === "confirmed" &&
                            (b.seats || []).some((s) => !s.isGivenTicket) && (
                              <button
                                onClick={() => checkInAll(b._id)}
                                disabled={checkingIn[b._id]}
                                title="Check in every seat on this booking"
                                className="inline-flex items-center px-2 py-1 rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider hover:bg-[#d4af37]/20 disabled:opacity-50 transition-colors cursor-pointer"
                              >
                                {checkingIn[b._id]
                                  ? "Checking in..."
                                  : "Check in all"}
                              </button>
                            )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-[#d4af37] font-semibold">
                        {naira(b.totalAmount)}
                        {b.discountApplied && (
                          <span className="block text-[10px] text-emerald-400">
                            discount applied
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            STATUS_STYLES[b.status] || STATUS_STYLES.cancelled
                          }`}
                        >
                          {b.status}
                        </span>
                        {(() => {
                          const seats = b.seats || [];
                          if (seats.length === 0) return null;
                          const attended = seats.filter(
                            (s) => s.isGivenTicket
                          ).length;
                          if (attended === seats.length) {
                            return (
                              <span className="ml-1 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/40">
                                <CheckCircle size={10} /> checked in
                              </span>
                            );
                          }
                          if (attended > 0) {
                            return (
                              <span className="ml-1 inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase border bg-amber-500/10 text-amber-400 border-amber-500/40">
                                partial {attended}/{seats.length}
                              </span>
                            );
                          }
                          return (
                            <span className="ml-1 inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase border bg-gray-500/10 text-gray-400 border-gray-600/40">
                              not checked in
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-[11px] whitespace-nowrap">
                        {fmtDate(b.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity feed */}
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-800">
              <h2 className="text-sm font-bold tracking-widest text-[#d4af37] uppercase">
                Activity Log
              </h2>
            </div>
            <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-800/70">
              {activity.length === 0 && (
                <p className="px-4 py-8 text-center text-gray-500 text-xs">
                  No activity recorded yet.
                </p>
              )}
              {activity.map((log) => (
                <div key={log._id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                      {log.action?.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">
                      {fmtDate(log.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 mt-1 break-words">
                    {log.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Team access (super admins only) */}
        {role === "super" && (
          <TeamAccess token={token} onLogout={onLogout} />
        )}
      </main>
    </div>
  );
};

const Admin = () => {
  const [session, setSession] = useState(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token || token === "null" || token === "undefined") return null;

      const raw = localStorage.getItem(PROFILE_KEY);
      let profile = {};
      if (raw && raw !== "null" && raw !== "undefined") {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") profile = parsed;
      }

      return {
        token,
        admin: profile.admin || "",
        role: profile.role || "admin",
      };
    } catch {
      return null;
    }
  });

  const login = (newSession) => {
    try {
      localStorage.setItem(TOKEN_KEY, newSession.token);
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({ admin: newSession.admin, role: newSession.role })
      );
    } catch {}
    setSession(newSession);
  };

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PROFILE_KEY);
    } catch {}
    setSession(null);
  }, []);

  if (!session?.token) return <Login onLogin={login} />;
  return (
    <Dashboard
      token={session.token}
      role={session.role}
      admin={session.admin}
      onLogout={logout}
    />
  );
};

export default Admin;

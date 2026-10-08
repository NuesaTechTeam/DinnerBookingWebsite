import React, { useCallback, useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import AdminAPI from "../utils/endpoints/adminApi.js";
import logo from "../assets/logo.png";

const TOKEN_KEY = "nuesa_admin_token";

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
        onLogin(res.token);
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

const Dashboard = ({ token, onLogout }) => {
  const [stats, setStats] = useState(null);
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
              Admin Dashboard · read only
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
                        {b.attendanceVerified && (
                          <span className="ml-1 inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase border bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/40">
                            in
                          </span>
                        )}
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
      </main>
    </div>
  );
};

const Admin = () => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || "";
    } catch {
      return "";
    }
  });

  const login = (newToken) => {
    try {
      localStorage.setItem(TOKEN_KEY, newToken);
    } catch {}
    setToken(newToken);
  };

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
    setToken("");
  }, []);

  if (!token) return <Login onLogin={login} />;
  return <Dashboard token={token} onLogout={logout} />;
};

export default Admin;

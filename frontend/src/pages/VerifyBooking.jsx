import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axiosInstance";
import {
  Shield,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { formatTierText } from "../lib/helpers.jsx";

const VerifyBooking = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState({
    _id: "test123",
    name: "Emma Then",
    matricNo: "21/ENG02/029",
    email: "okoyemcpaul86@gmail.com",
    phone: "+2348123456789",
    amount: 32000,
    status: "confirmed",
    attendanceVerified: false,
    attendanceVerifiedAt: new Date(),
    createdAt: new Date(),
    seats: [
      {
        seatNumber: "VVIP-1-S1",
        table: { tableNumber: "VVIP-5" },
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAttendance, setMarkingAttendance] = useState({});
  const [attendanceResult, setAttendanceResult] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await axios.get(`/booking/${bookingId}/booking-info`);
        setBooking(response.data.booking);
      } catch (err) {
        setError("Booking not found or invalid QR code");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const markAsAttended = async () => {
    if (!booking) return;

    setMarkingAttendance(true);
    try {
      const response = await axios.post(`/booking/verify/${bookingId}`);
      setAttendanceResult(response.data);

      if (response.data.success) {
        setBooking((prev) => ({
          ...prev,
          attendanceVerified: true,
          attendanceVerifiedAt: new Date(),
        }));
      }
    } catch (err) {
      setAttendanceResult({
        success: false,
        message: err.response?.data?.message || "Failed to mark attendance",
      });
    } finally {
      setMarkingAttendance(false);
    }
  };

  const markSeatAsAttended = async (seatId) => {
    if (!booking) return;

    setMarkingAttendance((prev) => ({ ...prev, [seatId]: true }));
    try {
      const response = await axios.post(
        `/booking/${bookingId}/mark-seat/${seatId}`
      );
      setAttendanceResult(response.data);

      if (response.data.success) {
        const updatedResponse = await axios.get(
          `/booking/${bookingId}/booking-info`
        );
        setBooking(updatedResponse.data.booking);
      }
    } catch (err) {
      setAttendanceResult({
        success: false,
        message:
          err.response?.data?.message || "Failed to mark seat attendance",
      });
    } finally {
      setMarkingAttendance((prev) => ({ ...prev, [seatId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)]"></div>
        <div className="text-center relative z-10">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <Shield className="w-8 h-8 text-[#d4af37] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-zinc-300 text-lg tracking-widest font-mono">
            VERIFYING RESERVATION...
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center relative overflow-hidden p-4 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1)_0%,transparent_70%)]"></div>

        <div className="bg-zinc-950/80 backdrop-blur-md border border-red-500/30 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative z-10">
          <div className="mb-6">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <div className="w-16 h-1 bg-red-500 mx-auto rounded-full"></div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-3 tracking-wider font-serif">
            ACCESS DENIED
          </h1>
          <p className="text-zinc-400 mb-8 leading-relaxed text-sm">
            This invitation could not be verified. The credential provided is invalid or has expired.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600/90 text-white py-3 rounded-xl hover:bg-red-600 transition-all duration-300 font-semibold tracking-wide"
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  const isConfirmed = booking.status === "confirmed";
  const isPending = booking.status === "pending";
  const isCancelled = booking.status === "cancelled";

  return (
    <div className="min-h-screen bg-[#09090b] text-white py-12 px-4 relative overflow-hidden selection:bg-[#d4af37] selection:text-black">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_75%)]"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Decorative corner accents */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-[#d4af37]/30"></div>
      <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-[#d4af37]/30"></div>
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-[#d4af37]/30"></div>
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-[#d4af37]/30"></div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#d4af37]" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2 tracking-wider">
            FÀÁJÍ LAWA
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mb-3"></div>
          <p className="text-zinc-400 tracking-widest text-xs uppercase font-mono">
            Official Ticket Verification
          </p>
        </div>

        {/* Main Verification Card */}
        <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Status Banner */}
          <div
            className={`py-4 text-center font-bold tracking-wider text-sm border-b relative ${
              isConfirmed
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : isPending
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              {isConfirmed && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {isPending && <AlertCircle className="w-5 h-5 text-amber-400" />}
              {isCancelled && <XCircle className="w-5 h-5 text-red-400" />}
              <span>
                {isConfirmed && "CONFIRMED RESERVATION"}
                {isPending && "PENDING VERIFICATION"}
                {isCancelled && "RESERVATION CANCELLED"}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Member Info */}
            <div className="text-center mb-8 pb-8 border-b border-zinc-800">
              <h2 className="text-2xl font-bold text-white mb-1 tracking-wide font-serif">
                {booking.name}
              </h2>
              {booking.matricNo && (
                <p className="text-zinc-400 font-mono text-sm mb-1">
                  {booking.matricNo}
                </p>
              )}
              <p className="text-xs text-zinc-500">{booking.email}</p>
            </div>

            {/* Booking Details Grid */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
                  <p className="text-xs text-zinc-500 mb-1 tracking-wider uppercase font-mono">
                    BOOKING REFERENCE
                  </p>
                  <p className="font-bold text-white font-mono text-sm">
                    #{booking._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
                  <p className="text-xs text-zinc-500 mb-1 tracking-wider uppercase font-mono">
                    TOTAL TRIBUTE
                  </p>
                  <p className="font-bold text-[#d4af37] text-lg font-mono">
                    ₦{booking.amount?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Seating Assignment */}
              <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-zinc-900 border border-[#d4af37]/30 p-5 rounded-xl">
                <div className="flex items-center mb-3">
                  <MapPin className="w-4 h-4 text-[#d4af37] mr-2" />
                  <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                    ASSIGNED POSITION
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">TABLE</p>
                    <p className="text-white font-semibold text-sm">
                      {formatTierText(booking.tables?.join(", ")) || "TBA"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">SEAT(S)</p>
                    <p className="text-white font-semibold text-sm">
                      {formatTierText(booking.seatNumbers?.join(", ")) || "TBA"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Discount Badge */}
              {booking.discountApplied && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center mr-3 text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                        ENGINEERING DISCOUNT
                      </p>
                      <p className="text-emerald-500/80 text-xs">
                        Student Perk Applied
                      </p>
                    </div>
                  </div>
                  <div className="text-emerald-400 font-bold font-mono text-sm">
                    -₦{booking.discountAmount?.toLocaleString() || "2,000"}
                  </div>
                </div>
              )}

              {booking.attendanceVerified && booking.attendanceVerifiedAt && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                  <h3 className="font-semibold text-emerald-400 text-sm mb-1 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" /> Attendance Recorded
                  </h3>
                  <p className="text-xs text-emerald-500/80 font-mono">
                    {new Date(booking.attendanceVerifiedAt).toLocaleString(
                      "en-NG",
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }
                    )}
                  </p>
                </div>
              )}

              {/* Timestamp */}
              <div className="flex items-center justify-center text-xs text-zinc-500 border-t border-zinc-800/80 pt-4 mt-4 font-mono">
                <Clock className="w-3.5 h-3.5 mr-2 text-zinc-600" />
                <p>
                  Booked on{" "}
                  {new Date(booking.createdAt).toLocaleDateString("en-NG", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seat Check-in Management Section */}
        {booking.seats && booking.seats.length > 0 && (
          <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-2xl p-6 mt-6">
            <h3 className="text-base font-semibold mb-4 text-white flex items-center">
              <Users className="w-4 h-4 mr-2 text-[#d4af37]" />
              Seat Breakdown ({booking.seats.length})
            </h3>
            <div className="space-y-3">
              {booking.seats.map((seat) => (
                <div
                  key={seat._id || seat.seatNumber}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-zinc-800 rounded-xl bg-zinc-900/40 gap-3"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-white text-sm">
                      Seat {formatTierText(seat.seatNumber)}
                    </span>
                    {seat.tableNumber && (
                      <span className="text-xs text-zinc-400 font-mono">
                        (Table {formatTierText(seat.tableNumber)})
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        seat.isGivenTicket
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {seat.isGivenTicket ? "Attended" : "Pending"}
                    </span>
                  </div>
                  {!seat.isGivenTicket && (
                    <button
                      onClick={() => markSeatAsAttended(seat._id)}
                      disabled={markingAttendance[seat._id]}
                      className="w-full sm:w-auto bg-[#d4af37] text-black hover:bg-[#b5922a] disabled:bg-zinc-800 disabled:text-zinc-500 text-xs font-semibold px-4 py-2 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                    >
                      {markingAttendance[seat._id]
                        ? "Marking..."
                        : "Mark Attended"}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {booking.allSeatsAttended && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl mt-4 text-center text-sm font-medium flex items-center justify-center">
                <CheckCircle className="w-4 h-4 mr-2" /> All seats have been marked as attended
              </div>
            )}
          </div>
        )}

        {/* Attendance Result Feedback Alert */}
        {attendanceResult && (
          <div
            className={`mt-6 p-4 rounded-xl border text-sm ${
              attendanceResult.success
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <div className="flex items-center">
              <span className="mr-3 text-lg">
                {attendanceResult.success ? "✅" : "❌"}
              </span>
              <div>
                <p className="font-semibold">
                  {attendanceResult.success
                    ? "Attendance Confirmed"
                    : "Action Failed"}
                </p>
                <p className="text-xs opacity-90 mt-0.5">
                  {attendanceResult.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Staff Instructions */}
        <div className="mt-6 bg-zinc-950/60 border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-center mb-3">
            <Shield className="w-5 h-5 text-amber-400 mr-2" />
            <h3 className="font-bold text-amber-400 tracking-wider text-xs uppercase font-mono">
              ENTRY VERIFICATION PROTOCOL
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-zinc-400">
            <li className="flex items-start">
              <span className="text-amber-400 mr-2">▪</span>
              <span>Verify attendee identity against official student ID or documentation</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-400 mr-2">▪</span>
              <span>Confirm assigned seating layout matches venue layout</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-400 mr-2">▪</span>
              <span>All table members must present individual seating passes</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-400 mr-2">▪</span>
              <span className="text-red-400 font-medium">
                DENY ENTRY if ticket status is not "CONFIRMED"
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VerifyBooking;
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// import axios from "axios";
import axios from "../utils/axiosInstance"
import {
  Shield,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const VerifyBooking = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState({
    _id: "test123",
    name: "Emma Then",
    matricNo: "21/ENG02/029",
    email: "okoyemcpaul86@gmail.com", // Send to yourself for testing
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
    const [markingAttendance, setMarkingAttendance] = useState(false);
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
    
      // Use the same verification logic as before
      const response = await axios.post(`/booking/verify/${bookingId}`);
      setAttendanceResult(response.data);

      // Update local booking state if successful
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-600 rounded-full opacity-5 blur-3xl animate-pulse"></div>

        <div className="text-center relative z-10">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <Shield className="w-8 h-8 text-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-300 text-lg tracking-wider">
            VERIFYING ACCESS...
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden p-4">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full opacity-5 blur-3xl"></div>

        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-red-600 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 text-center relative z-10">
          <div className="mb-6">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <div className="w-16 h-1 bg-red-600 mx-auto"></div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3 tracking-wider">
            ACCESS DENIED
          </h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            This invitation could not be verified. The Famiglia does not
            recognize this credential.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-all duration-300 font-semibold tracking-wide"
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
    <div className="min-h-screen bg-black py-8 px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-600 rounded-full opacity-5 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600 rounded-full opacity-5 blur-3xl"></div>

      {/* Decorative corner elements */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-red-600 opacity-30"></div>
      <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-red-600 opacity-30"></div>
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-red-600 opacity-30"></div>
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-red-600 opacity-30"></div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              {/* <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-black"></div> */}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-wider">
            CASABLANCA
          </h1>
          <div className="w-24 h-1 bg-red-600 mx-auto mb-4"></div>
          <p className="text-gray-300 tracking-widest text-sm">
            MEMBER VERIFICATION
          </p>
        </div>

        {/* Main Booking Card */}
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-700 rounded-lg shadow-2xl overflow-hidden">
          {/* Status Banner */}
          <div
            className={`py-4 text-center text-white font-bold tracking-wider relative ${
              isConfirmed
                ? "bg-gradient-to-r from-green-700 to-green-600"
                : isPending
                ? "bg-gradient-to-r from-yellow-700 to-yellow-600"
                : "bg-gradient-to-r from-red-700 to-red-600"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              {isConfirmed && <CheckCircle className="w-6 h-6" />}
              {isPending && <AlertCircle className="w-6 h-6" />}
              {isCancelled && <XCircle className="w-6 h-6" />}
              <span>
                {isConfirmed && "FAMIGLIA MEMBER CONFIRMED"}
                {isPending && "PENDING INITIATION"}
                {isCancelled && "MEMBERSHIP REVOKED"}
              </span>
            </div>
          </div>

          <div className="p-8">
            {/* Member Info */}
            <div className="text-center mb-8 pb-8 border-b border-gray-800">
              <div className="mb-4">
                <div className="w-2 h-2 bg-red-600 rounded-full mx-auto mb-4"></div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">
                {booking.name}
              </h2>
              <p className="text-gray-400 font-mono text-lg mb-1">
                {booking.matricNo}
              </p>
              <p className="text-sm text-gray-500">{booking.email}</p>
            </div>

            {/* Booking Details Grid */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black border border-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1 tracking-wider">
                    MEMBER ID
                  </p>
                  <p className="font-bold text-white font-mono">
                    {booking._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div className="bg-black border border-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1 tracking-wider">
                    TRIBUTE
                  </p>
                  <p className="font-bold text-red-500 text-xl">
                    ₦{booking.amount?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Seating Assignment */}
              <div className="bg-gradient-to-br from-red-900/20 to-black border-2 border-red-900/50 p-5 rounded-lg">
                <div className="flex items-center mb-3">
                  <MapPin className="w-5 h-5 text-red-500 mr-2" />
                  <h3 className="font-bold text-white tracking-wider">
                    RESERVED POSITION
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">TABLE</p>
                    <p className="text-white font-semibold">
                      {booking.tables?.join(", ") || "TBA"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">SEAT</p>
                    <p className="text-white font-semibold">
                      {booking.seats?.join(", ") || "TBA"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Discount Badge */}
              {booking.discountApplied && (
                <div className="bg-gradient-to-r from-green-900/30 to-black border border-green-700/50 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xl">🎓</span>
                    </div>
                    <div>
                      <p className="text-green-400 font-semibold text-sm">
                        ENGINEERING PRIVILEGE
                      </p>
                      <p className="text-green-300 text-xs">
                        Family Discount Applied
                      </p>
                    </div>
                  </div>
                  <div className="text-green-400 font-bold">
                    -₦{booking.discountAmount?.toLocaleString() || "2,000"}
                  </div>
                </div>
              )}

              {booking.attendanceVerified && booking.attendanceVerifiedAt && (
                <div className="bg-gradient-to-r from-green-900/30 to-black border border-green-700/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-1 flex items-center">
                    <span className="mr-2">✅</span> Attendance Recorded
                  </h3>
                  <p className="text-green-700">
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
              <div className="flex items-center justify-center text-sm text-gray-500 border-t border-gray-800 pt-5 mt-5">
                <Clock className="w-4 h-4 mr-2" />
                <p>
                  Inducted{" "}
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

        {/* Attendance Result Message */}
        {attendanceResult && (
          <div
            className={`mt-6 p-6 rounded-lg border ${
              attendanceResult.success
                ? "bg-gradient-to-br from-green-900/20 to-black border-2 border-green-700/50 text-green-800"
                : "bg-gradient-to-br from-red-900/20 to-black border-2 border-red-700/50 text-red-800"
            }`}
          >
            <div className="flex items-center">
              <span className="text-xl mr-2">
                {attendanceResult.success ? "✅" : "❌"}
              </span>
              <div>
                <p className="font-semibold">
                  {attendanceResult.success
                    ? "Attendance Confirmed!"
                    : "Attendance Failed"}
                </p>
                <p className="text-sm mt-1">{attendanceResult.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Staff Instructions */}
        <div className="mt-6 bg-gradient-to-br from-yellow-900/20 to-black border-2 border-yellow-700/50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 text-yellow-500 mr-3" />
            <h3 className="font-bold text-yellow-400 tracking-wider">
              DOOR PROTOCOL
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2 mt-0.5">▪</span>
              <span>Verify member identity against official documentation</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2 mt-0.5">▪</span>
              <span>Confirm seating arrangement matches event floor plan</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2 mt-0.5">▪</span>
              <span>
                Entire party must arrive together for group reservations
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2 mt-0.5">▪</span>
              <span className="text-red-400 font-semibold">
                DENY ENTRY if status is not "CONFIRMED"
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 justify-center space-x-4 hidden">
          {!booking.attendanceVerified && booking.status === "confirmed" && (
            <button
              onClick={markAsAttended}
              disabled={markingAttendance}
              className="bg-green-600 text-white py-3 px-4 font-cormorant rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {markingAttendance ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500 mr-2"></div>
                  Marking Attendance...
                </>
              ) : (
                <>
                  <span className="mr-2">✅</span>
                  Mark as Attended
                </>
              )}
            </button>
          )}

          {booking.attendanceVerified && (
            <div className="text-center text-green-600 font-semibold py-3">
              ✅ Attendance confirmed
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-300 font-semibold tracking-wide flex items-center"
          >
            <span className="mr-2">🔄</span>
            REFRESH
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyBooking;

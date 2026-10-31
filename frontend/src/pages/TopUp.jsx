import React, { useState } from "react";
import { Link } from "react-router-dom";
import { usePaystackPayment } from "react-paystack";
import { CheckCircle } from "lucide-react";
import axios from "../utils/axiosInstance.js";
import logo from "../assets/logo.png";

const inputClass =
  "w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-[#d4af37] focus:outline-none transition-colors";
const labelClass = "text-gray-300 text-xs font-medium uppercase tracking-wider";

// Unlisted page for making an extra payment (e.g. settling a balance on a ticket).
const TopUp = () => {
  const [form, setForm] = useState({ name: "", email: "", entryCode: "", amount: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  const initializePayment = usePaystackPayment({
    publicKey: import.meta.env.VITE_PUBLIC_KEY_PAYSTACK,
  });

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Ask the server to confirm with Paystack; retry on network trouble because the money is already taken
  const confirm = async (reference, attempt = 1) => {
    try {
      const { data } = await axios.post("/payment/topup/verify", { reference });
      setDone({ amount: data.amount, reference });
      setBusy(false);
    } catch (err) {
      const status = err.response?.status;
      const retryable = !err.response || status === 429 || status >= 500;
      if (retryable && attempt < 5) {
        setTimeout(() => confirm(reference, attempt + 1), attempt * 3000);
        return;
      }
      setBusy(false);
      setError(
        `We're still confirming your payment. Reference: ${reference}. Please keep it - do not pay again.`
      );
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await axios.post("/payment/topup", {
        name: form.name,
        email: form.email,
        amount: form.amount,
        entryCode: form.entryCode,
        note: form.note,
      });
      initializePayment({
        config: {
          email: form.email.trim(),
          amount: Math.round(data.amount * 100),
          reference: data.reference,
          metadata: { topup: true, payerName: form.name },
        },
        onSuccess: (response) => confirm(response.reference || data.reference),
        onClose: () => setBusy(false),
      });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't start the payment. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center px-5 py-10 selection:bg-[#d4af37] selection:text-black">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src={logo} alt="Logo" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-extrabold text-[#d4af37] tracking-widest uppercase">
            Make a Payment
          </h1>
        </div>

        {done ? (
          <div className="rounded-2xl border border-emerald-800/50 bg-emerald-950/30 p-6 text-center space-y-3">
            <CheckCircle className="mx-auto text-emerald-400" size={36} />
            <p className="text-lg font-semibold text-emerald-300">Payment received. Thank you!</p>
            <p className="text-sm text-gray-300">₦{Number(done.amount).toLocaleString()} paid</p>
            <p className="text-[11px] text-gray-500 break-all">Reference: {done.reference}</p>
            <Link to="/" className="inline-block mt-2 text-xs font-bold tracking-widest uppercase text-[#d4af37] underline">
              Back to home
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl border border-gray-800 bg-[#0a0a0a] p-5 space-y-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Full name</label>
              <input name="name" value={form.name} onChange={change} required disabled={busy} className={inputClass} placeholder="Your full name" />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Email address</label>
              <input type="email" name="email" value={form.email} onChange={change} required disabled={busy} className={inputClass} placeholder="your.email@example.com" />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Ticket entry code (optional)</label>
              <input name="entryCode" value={form.entryCode} onChange={change} disabled={busy} inputMode="numeric" className={inputClass} placeholder="6-digit code on the ticket" />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Amount (₦)</label>
              <input type="number" name="amount" value={form.amount} onChange={change} required disabled={busy} min="100" step="1" inputMode="numeric" className={inputClass} placeholder="e.g. 1030" />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Note (optional)</label>
              <input name="note" value={form.note} onChange={change} disabled={busy} maxLength={300} className={inputClass} placeholder="What is this payment for?" />
            </div>

            {error && (
              <p className="text-xs text-red-300 bg-red-950/40 border border-red-800 rounded-lg p-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] text-black font-extrabold py-3 rounded-lg text-sm uppercase tracking-widest disabled:opacity-50 cursor-pointer"
            >
              {busy ? "Please wait..." : form.amount ? `Pay ₦${Number(form.amount).toLocaleString()}` : "Pay"}
            </button>
            <p className="text-[11px] text-gray-500 text-center">Secure payment powered by Paystack</p>
          </form>
        )}
      </div>
    </div>
  );
};

export default TopUp;

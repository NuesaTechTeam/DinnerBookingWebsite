import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance.js";
import { getPass, setPass, onPassChange } from "../lib/bookingPass.js";

// SHA-256 fingerprint of the 7 letters to type. Only the fingerprint ships in
// the page, so the letters themselves never appear in the site's code.
const FINGERPRINT = "aa838baa048b2ca558d671b30f8c0a2ef7eeec70502a6fffccaefa837da07661";
const LENGTH = 7;

const sha256 = async (text) => {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

// Mounted once for the whole site. Listens for keystrokes; when the last
// letters typed match, asks the server for a pass. Silent on every outcome.
export const useKeyPass = () => {
  useEffect(() => {
    let typed = "";
    let busy = false;

    const onKey = async (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (typeof e.key !== "string" || e.key.length !== 1) return;
      typed = (typed + e.key.toUpperCase()).slice(-LENGTH);
      if (typed.length < LENGTH || busy) return;
      try {
        if ((await sha256(typed)) !== FINGERPRINT) return;
        busy = true;
        const { data } = await axios.post("/booking/pass", { phrase: typed });
        if (data?.token) setPass(data.token);
      } catch {
        /* wrong or unreachable: do nothing, show nothing */
      } finally {
        busy = false;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
};

// "loading" | "closed" | "open"
export const useBookingGate = () => {
  const [pass, setPassState] = useState(getPass());
  const [closed, setClosed] = useState(null);

  useEffect(() => onPassChange(() => setPassState(getPass())), []);

  useEffect(() => {
    let alive = true;
    axios
      .get("/booking/status")
      .then(({ data }) => alive && setClosed(!!data.closed))
      // If the check can't be made, show the page - the server still decides
      .catch(() => alive && setClosed(false));
    return () => {
      alive = false;
    };
  }, []);

  if (pass) return "open";
  if (closed === null) return "loading";
  return closed ? "closed" : "open";
};

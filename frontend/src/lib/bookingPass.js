// A booking pass is a short-lived token the server hands out; the page sends it
// with booking requests so one visitor can book while bookings are closed.
const KEY = "dn_p";
const EVENT = "dn-p";

export const getPass = () => {
  try {
    return sessionStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
};

export const setPass = (token) => {
  try {
    sessionStorage.setItem(KEY, token);
  } catch {
    /* storage unavailable (private mode) - the pass just won't persist */
  }
  window.dispatchEvent(new Event(EVENT));
};

export const clearPass = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
};

export const onPassChange = (handler) => {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
};

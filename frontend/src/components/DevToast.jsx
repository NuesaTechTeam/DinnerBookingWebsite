import { useEffect } from "react";
import {useToast } from "../context/modal/useToast"

const DevToast = () => {
  const { showToast, TOAST_TYPES } = useToast();

  useEffect(() => {
    showToast(
      "🛠️ Development Mode - Toast Visible for UI Testing",
      TOAST_TYPES.INFO,
      0 // 0 means never auto-dismiss
    );

  
  }, [showToast, TOAST_TYPES]);

  return null;
};

export default DevToast;

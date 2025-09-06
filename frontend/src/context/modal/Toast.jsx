import { useState } from "react";
import { Toast } from "radix-ui";
import { ToastContext } from "./useToast";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";


const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
  WARNING: "warning",
};

const ToastComponent = ({ children }) => {

  //toast state
  const [toasts, setToasts] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentToast, setCurrentToast] = useState(null);


  const showToast = (message, type = TOAST_TYPES.SUCCESS, duration = 2000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    if (!open) {
      setCurrentToast(newToast);
      setOpen(true);
    }
  };

  const onToastClose = () => {
    setOpen(false);
    setTimeout(() => {
      if (toasts.length > 0) {
        const [nextToast, ...remainingToasts] = toasts;
        setCurrentToast(nextToast);
        setToasts(remainingToasts);
        setOpen(true);
      } else {
        setCurrentToast(null);
      }
    }, 300);
  };


  const getToastStyles = (type) => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return {
          icon: <CheckCircle className="text-green-600 size-6" />,
          bgColor: "bg-green-200",
          borderColor: "border-green-300",
        };
      case TOAST_TYPES.ERROR:
        return {
          icon: <AlertCircle className="text-red-600 size-6" />,
          bgColor: "bg-red-200",
          borderColor: "border-red-300",
        };
      case TOAST_TYPES.INFO:
        return {
          icon: <Info className="text-blue-600 size-6" />,
          bgColor: "bg-blue-200",
          borderColor: "border-blue-300",
        };
      case TOAST_TYPES.WARNING:
        return {
          icon: <AlertTriangle className="text-yellow-600 size-6" />,
          bgColor: "bg-yellow-200",
          borderColor: "border-yellow-300",
        };
      default:
        return {
          icon: <Info className="text-blue-600 size-6" />,
          bgColor: "bg-blue-200",
          borderColor: "border-blue-300",
        };
    }
  };



  const toastContextValue = {
    showToast,
    TOAST_TYPES,
  };

  return (
      <ToastContext.Provider value={toastContextValue}>
        {children}
       
        <Toast.Provider swipeDirection="right">
          {currentToast && (
            <Toast.Root
              className={`${getToastStyles(currentToast.type).bgColor} ${
                getToastStyles(currentToast.type).borderColor
              } border rounded-lg shadow-lg min-w-[260px] p-1 flex items-center gap-2 data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut `}
              open={open}
              onOpenChange={setOpen}
              duration={currentToast.duration}
              onEscapeKeyDown={onToastClose}
              onSwipeEnd={onToastClose}
              onClose={onToastClose}
            >
              {getToastStyles(currentToast.type).icon}
              <div className="flex-1">
                <Toast.Title className="font-medium text-gray-900">
                  {currentToast.type.charAt(0).toUpperCase() +
                    currentToast.type.slice(1)}
                </Toast.Title>
                <Toast.Description className="text-gray-600 text-sm">
                  {currentToast.message}
                </Toast.Description>
              </div>
              <Toast.Close asChild className="flex-none">
                <button className="rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="size-6" />
                </button>
              </Toast.Close>
            </Toast.Root>
          )}
          <Toast.Viewport className="fixed w-190 top-2 right-2 flex flex-col gap-2  max-w-[90vw] m-0 list-none z-50 outline-none" />
        </Toast.Provider>
      </ToastContext.Provider>
  );
};

export default ToastComponent;
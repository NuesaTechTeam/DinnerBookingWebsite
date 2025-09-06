import { StrictMode } from "react";
import { GlobalProvider, Toast } from "./context/index.js";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <QueryClientProvider client={queryClient}>
    <Toast>
      <GlobalProvider>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </GlobalProvider>
    </Toast>
  </QueryClientProvider>
);

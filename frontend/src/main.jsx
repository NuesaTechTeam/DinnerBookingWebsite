import { StrictMode } from "react";
import { GlobalProvider } from "./context/index.js";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <GlobalProvider>
    <App />
  </GlobalProvider>
);

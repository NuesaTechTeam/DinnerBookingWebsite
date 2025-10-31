import "./index.css";
import { Booking, Gallery, Landing, Voting, VerifyBooking } from "./pages";
import { ScrollToTop, Layout, DevToast } from "./components";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React from "react";

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      {/* <DevToast /> */}
      <Routes>
        <Route exact path="/" element={<Landing />} />
        <Route exact path="/book" element={<Booking />} />
        <Route exact path="/gallery" element={<Gallery />} />
        <Route exact path="/voting" element={<Voting />} />
        <Route exact path="/verify/:bookingId" element={<VerifyBooking />} />
      </Routes>
    </Router>
  );
};

export default App;

import "./index.css";
import { Booking, Gallery, Landing, Voting } from "./pages";
import { ScrollToTop, Layout } from "./components";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React from "react";

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route exact path='/' element={<Landing />} />
        <Route exact path='/book' element={<Booking />} />
        <Route exact path='/gallery' element={<Gallery />} />
        <Route exact path='/voting' element={<Voting />} />
      </Routes>
    </Router>
  );
};

export default App;

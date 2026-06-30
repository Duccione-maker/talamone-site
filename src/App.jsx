import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Apartment from "./pages/Apartment";
import BookingSuccess from "./pages/BookingSuccess";
import Admin from "./pages/Admin";

export default function App() {
  const [lang, setLang] = useState("en");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home lang={lang} setLang={setLang} scrollY={scrollY} />}
        />
        <Route
          path="/appartamenti/:id"
          element={<Apartment lang={lang} />}
        />
        <Route
          path="/booking-success"
          element={<BookingSuccess lang={lang} />}
        />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { HomeSEO } from "../components/SEO";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { APARTMENTS } from "../data/apartments";

const APARTMENT = APARTMENTS[0]; // single apartment

const APT_IMAGES = [
  "/images/hero1.jpg",
  "/images/hero2.jpg",
  "/images/hero3.jpg",
  "/images/hero4.jpg",
  "/images/esterno.jpg",
  "/images/matrimoniale.jpg",
  "/images/divano%20letto.jpg",
  "/images/divano%20letto%202.jpg",
  "/images/soggiorno%202.jpg",
  "/images/piano%20cottura.jpg",
  "/images/primo%20bagno.jpg",
  "/images/primo%20bagno%202.jpg",
  "/images/secondo%20bagno%201.jpg",
  "/images/secondo%20bagno%202.jpg",
  "/images/doccia.jpg",
];

const HERO_IMAGES = [
  "/images/hero1.jpg",
  "/images/hero2.jpg",
  "/images/hero3.jpg",
  "/images/hero4.jpg",
];

// ─── TRANSLATIONS ───────────────────────────────────────────────────────────

const T = {
  it: {
    nav: ["L'Appartamento", "Il Mare", "Posizione", "Tips", "Prenota"],
    heroSub: "Talamone · Maremma · Toscana",
    heroTagline1: "Non una spiaggia.",
    heroTagline2: "Un luogo.",
    heroDetails: "1 appartamento · 100 mq · 50 m dal mare · nel cuore della Maremma",
    heroCta: "Prenota direttamente →",
    essLabels: ["metri dal mare", "m²", "appartamento", "compromessi"],
    aptSection: "L'APPARTAMENTO",
    aptTitle: "Cala di Forno Talamone",
    aptCta: "Scopri i dettagli →",
    seaLabel: "IL MARE",
    seaTitle: "Il parco. Il mare. Nient'altro.",
    seaDesc:
      "Cala di Forno è nel cuore del Parco Naturale della Maremma. Cinquanta metri separano l'appartamento dalla battigia. Acqua cristallina, silenzio, la macchia mediterranea. Un posto dove il telefono diventa ininfluente.",
    posLabel: "POSIZIONE",
    posTitle1: "Maremma, terra di mezzo.",
    posTitle2: "Tutto raggiungibile, niente affollato.",
    posDesc:
      "Talamone è uno dei borghi costieri meno conosciuti della Toscana. A portata di mano le lagune di Orbetello, il Monte Argentario, il Giardino dei Tarocchi di Capalbio. Lontano dai grandi flussi turistici.",
    netIntro: "Cala di Forno fa parte del network No Tuscany. La nostra filosofia è semplice:",
    netDesc:
      "Niente algoritmi, niente recensioni anonime. Solo una conoscenza vera del territorio, costruita in anni di vita qui. Chi prenota a Talamone accede a un modo diverso di vivere la Toscana.",
    netGuests: "PER I NOSTRI OSPITI",
    netGuide:
      "La guida interattiva riservata agli ospiti. Ristoranti, artigiani, esperienze — solo posti selezionati personalmente, dove il tuo nome apre porte.",
    netLink: "Scopri No Tuscany →",
    bookLabel: "PRENOTA",
    bookTitle: "Direttamente. Senza intermediari.",
    bookDesc:
      "Prenota qui per il miglior prezzo garantito. Nessuna commissione, nessuna piattaforma. Solo tu e Cala di Forno.",
    bookWidget: "Prenota",
    bookBtn: "Verifica disponibilità →",
    bookChecking: "Verifica in corso...",
    bookUnavailable: "Date non disponibili. Prova altre date.",
    bookMinNights: "Soggiorno minimo 5 notti.",
    bookError: "Errore. Riprova o contattaci su WhatsApp.",
    footerPlace: "Maremma, Toscana",
    apt: APARTMENT.it,
    cities: [
      { highlight: "Laguna, tonno, Etruschi" },
      { highlight: "Monte Argentario, porto" },
      { highlight: "Borgo medievale, Giardino dei Tarocchi" },
      { highlight: "Maremma, mura medievali" },
      { highlight: "Piazza del Campo, Duomo, Palio" },
      { highlight: "Colosseo, Vaticano, storia" },
    ],
  },
  en: {
    nav: ["The Apartment", "The Sea", "Location", "Tips", "Book"],
    heroSub: "Talamone · Maremma · Tuscany",
    heroTagline1: "Not a beach.",
    heroTagline2: "A place.",
    heroDetails: "1 apartment · 100 sqm · 50 m from the sea · in the heart of Maremma",
    heroCta: "Book directly →",
    essLabels: ["metres from the sea", "sqm", "apartment", "compromises"],
    aptSection: "THE APARTMENT",
    aptTitle: "Cala di Forno Talamone",
    aptCta: "Explore details →",
    seaLabel: "THE SEA",
    seaTitle: "The park. The sea. Nothing else.",
    seaDesc:
      "Cala di Forno sits in the heart of the Maremma Natural Park. Fifty metres of pebbles separate the apartment from the shoreline. Crystal-clear water, silence, Mediterranean scrub. A place where your phone becomes irrelevant.",
    posLabel: "LOCATION",
    posTitle1: "Maremma, land between lands.",
    posTitle2: "Everything reachable, nothing crowded.",
    posDesc:
      "Talamone is one of Tuscany's least-known coastal villages. Within easy reach: the Orbetello lagoons, Monte Argentario, Capalbio's Tarot Garden. Far from the main tourist flows.",
    netIntro: "Cala di Forno is part of the No Tuscany network. Our philosophy is simple:",
    netDesc:
      "No algorithms, no anonymous reviews. Just real knowledge of the territory, built over years of living here. Guests at Talamone get access to a different way of experiencing Tuscany.",
    netGuests: "FOR OUR GUESTS",
    netGuide:
      "The interactive guide reserved for our guests. Restaurants, artisans, experiences — only personally selected spots, where your name opens doors.",
    netLink: "Discover No Tuscany →",
    bookLabel: "BOOK",
    bookTitle: "Directly. No middlemen.",
    bookDesc:
      "Book here for the best guaranteed price. No commission, no platforms. Just you and Cala di Forno.",
    bookWidget: "Book",
    bookBtn: "Check availability →",
    bookChecking: "Checking...",
    bookUnavailable: "Dates not available. Try different dates.",
    bookMinNights: "Minimum stay is 5 nights.",
    bookError: "Error. Please retry or contact us on WhatsApp.",
    footerPlace: "Maremma, Tuscany",
    apt: APARTMENT.en,
    cities: [
      { highlight: "Lagoon, tuna, Etruscans" },
      { highlight: "Monte Argentario, harbour" },
      { highlight: "Medieval village, Tarot Garden" },
      { highlight: "Maremma capital, medieval walls" },
      { highlight: "Piazza del Campo, Duomo, Palio" },
      { highlight: "Colosseum, Vatican, history" },
    ],
  },
};

const CITY_NAMES = ["Orbetello", "Porto Santo Stefano", "Capalbio", "Grosseto", "Siena", "Roma"];
const CITY_KM = [12, 22, 28, 46, 105, 175];

// ─── APARTMENT SLIDESHOW (auto) ──────────────────────────────────────────────

function AptSlideshow({ images }) {
  const [idx, setIdx] = useState(0);
  const [preloaded, setPreloaded] = useState(new Set([0, 1]));

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((i) => {
        const next = (i + 1) % images.length;
        setPreloaded((s) => new Set([...s, next, (next + 1) % images.length]));
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div style={{ position: "relative", width: "100%", height: 520, overflow: "hidden", background: "#111" }}>
      {images.map((src, i) =>
        preloaded.has(i) ? (
          <img
            key={src}
            src={src}
            alt={`Cala di Forno ${i + 1}`}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", opacity: i === idx ? 1 : 0,
              transition: "opacity 1.2s ease",
            }}
          />
        ) : null
      )}
      <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex" }}>
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => { setIdx(i); setPreloaded((s) => new Set([...s, i, (i + 1) % images.length])); }}
            aria-label={`Foto ${i + 1}`}
            style={{ width: 24, height: 24, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: i === idx ? "#fff" : "rgba(255,255,255,0.35)", display: "block", transition: "background 0.3s" }} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── BOOKING WIDGET ──────────────────────────────────────────────────────────

function BookingWidget({ t, lang }) {
  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [adults, setAdults] = useState(2);
  const [childAges, setChildAges] = useState([]);
  const [status, setStatus] = useState(null);
  const [debugMsg, setDebugMsg] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountStatus, setDiscountStatus] = useState(null);
  const [discountData, setDiscountData] = useState(null);
  const [availResult, setAvailResult] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  useEffect(() => {
    setLoadingDates(true);
    fetch(`/.netlify/functions/get-blocked-dates?apartment=cala`)
      .then((r) => r.json())
      .then((data) => {
        if (data.blocked) {
          setBlockedDates(data.blocked.map((d) => new Date(d + "T12:00:00")));
        }
      })
      .catch(() => setBlockedDates([]))
      .finally(() => setLoadingDates(false));
  }, []);

  const checkIn = range.from ? range.from.toISOString().slice(0, 10) : "";
  const checkOut = range.to ? range.to.toISOString().slice(0, 10) : "";
  const MIN_NIGHTS = 5;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nights =
    range.from && range.to
      ? Math.round((range.to - range.from) / (1000 * 60 * 60 * 24))
      : 0;

  const CLEANING_FEE = 49;
  const CITY_TAX_PER_PERSON = 1.50;
  const MAX_TAX_NIGHTS = 5;

  const taxablePersons = adults + childAges.filter((age) => age >= 14).length;
  const cityTaxNights = Math.min(nights, MAX_TAX_NIGHTS);
  const cityTaxCents = Math.round(taxablePersons * cityTaxNights * CITY_TAX_PER_PERSON * 100);
  const cleaningCents = CLEANING_FEE * 100;
  const totalGuests = adults + childAges.length;

  const calcDiscount = (accommodationCents) => {
    if (!discountData || discountStatus !== "valid") return 0;
    if (discountData.discount_type === "percent") {
      return Math.round(accommodationCents * discountData.discount_value / 100);
    }
    return Math.min(Math.round(discountData.discount_value * 100), accommodationCents);
  };

  const handleCheck = async () => {
    if (!checkIn || !checkOut) return;
    if (nights < MIN_NIGHTS) { setStatus("minnights"); return; }
    setStatus("checking");
    try {
      const res = await fetch("/.netlify/functions/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartment: "cala", checkIn, checkOut }),
      });
      const data = await res.json();
      if (!data.available) {
        setStatus("unavailable");
        setDebugMsg(JSON.stringify(data));
        return;
      }
      setAvailResult(data);
      setStatus("available");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const handleRequest = async () => {
    if (!guestName || !guestEmail) return;
    setStatus("submitting");
    const discountCents = calcDiscount(availResult.totalCents);
    const finalTotal = availResult.totalCents - discountCents + cityTaxCents + cleaningCents;
    const totalStr = (finalTotal / 100).toFixed(2);
    const browserLang = navigator.language?.slice(0, 2).toLowerCase();
    const emailLang = ["it", "en", "de", "fr", "es"].includes(browserLang) ? browserLang : lang;
    const adminUrl = `https://talamone.notuscany.com/admin?name=${encodeURIComponent(guestName)}&email=${encodeURIComponent(guestEmail)}&checkin=${checkIn}&checkout=${checkOut}&nights=${availResult.nights}&guests=${totalGuests}&total=${totalStr}&lang=${emailLang}`;
    const body = new URLSearchParams({
      "form-name": "booking-request",
      name: guestName,
      email: guestEmail,
      phone: guestPhone,
      checkin: checkIn,
      checkout: checkOut,
      nights: availResult.nights,
      guests: totalGuests,
      total: `€${totalStr}`,
      discount: discountStatus === "valid" ? discountCode.trim().toUpperCase() : "",
      admin_url: adminUrl,
    });
    try {
      await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const handleDiscountBlur = async () => {
    const code = discountCode.trim().toUpperCase();
    if (!code) { setDiscountStatus(null); setDiscountData(null); return; }
    setDiscountStatus("checking");
    try {
      const res = await fetch("/.netlify/functions/verify-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, apartment: "cala" }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscountStatus("valid");
        setDiscountData({ discount_type: data.discount_type, discount_value: data.discount_value });
      } else {
        setDiscountStatus("invalid");
        setDiscountData(data.debug || null);
      }
    } catch {
      setDiscountStatus("invalid");
      setDiscountData(null);
    }
  };

  const isIt = lang === "it";

  return (
    <div style={styles.bookingWidget}>
      <div style={styles.bookingTitle}>{t.bookWidget}</div>
      <div style={styles.bookingFields}>

        {/* Calendar */}
        <div style={styles.calendarWrapper}>
          {loadingDates && (
            <div style={styles.calendarLoading}>
              {isIt ? "Caricamento disponibilità..." : "Loading availability..."}
            </div>
          )}
          <style>{calendarCss}</style>
          <DayPicker
            mode="range"
            selected={range}
            onSelect={(r) => { setRange(r || { from: undefined, to: undefined }); setStatus(null); }}
            disabled={[{ before: today }, ...blockedDates]}
            numberOfMonths={2}
            showOutsideDays={false}
            weekStartsOn={1}
          />
          <div style={styles.calendarLegend}>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, background: "#fff", border: "1px solid #c8bfb1" }} />
              <span>{isIt ? "Disponibile" : "Available"}</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, background: "#c8a89a" }} />
              <span>{isIt ? "Occupato" : "Unavailable"}</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, background: "#1a1a1a" }} />
              <span>{isIt ? "Selezionato" : "Selected"}</span>
            </div>
          </div>
          {range.from && range.to && (
            <div style={styles.rangeLabel}>
              {range.from.toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}
              {" → "}
              {range.to.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}
              {" · "}
              <strong>{nights} {nights === 1 ? "notte" : "notti"}</strong>
              {nights > 0 && nights < 5 && (
                <span style={{ color: "#a0522d", marginLeft: 8 }}>
                  {isIt ? "(min. 5 notti)" : "(min. 5 nights)"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Adulti */}
        <div style={styles.fieldGroup}>
          <label htmlFor="sel-adults" style={styles.fieldLabel}>{isIt ? "ADULTI" : "ADULTS"}</label>
          <select id="sel-adults" value={adults} onChange={(e) => setAdults(Number(e.target.value))} style={styles.fieldInput}>
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label htmlFor="sel-children" style={styles.fieldLabel}>{isIt ? "BAMBINI" : "CHILDREN"}</label>
          <select
            id="sel-children"
            value={childAges.length}
            onChange={(e) => {
              const n = Number(e.target.value);
              setChildAges((prev) => {
                const next = [...prev];
                while (next.length < n) next.push(5);
                return next.slice(0, n);
              });
            }}
            style={styles.fieldInput}
          >
            {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {childAges.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 10, letterSpacing: 1.5, color: "#5a5248", fontFamily: "'DM Sans', sans-serif" }}>
              {isIt ? "ETÀ DEI BAMBINI" : "CHILDREN'S AGES"}
            </div>
            {childAges.map((age, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "#4a4039", width: 75, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
                  {isIt ? `Bambino ${i + 1}` : `Child ${i + 1}`}
                </span>
                <select
                  value={age}
                  aria-label={isIt ? `Età bambino ${i + 1}` : `Child ${i + 1} age`}
                  onChange={(e) => {
                    const next = [...childAges];
                    next[i] = Number(e.target.value);
                    setChildAges(next);
                  }}
                  style={{ ...styles.fieldInput, flex: 1, fontSize: 12 }}
                >
                  {Array.from({ length: 18 }, (_, a) => (
                    <option key={a} value={a}>
                      {a === 0 ? (isIt ? "< 1 anno" : "< 1 year") : `${a} ${isIt ? "anni" : "years"}`}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: 10, color: age >= 14 ? "#a0522d" : "#5a5248", fontFamily: "'DM Sans', sans-serif", width: 60, textAlign: "right" }}>
                  {age >= 14
                    ? (isIt ? "tassa sì" : "tax applies")
                    : (isIt ? "esentato" : "exempt")}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Codice sconto */}
        <div style={styles.fieldGroup}>
          <label style={styles.fieldLabel}>{isIt ? "CODICE SCONTO (opzionale)" : "DISCOUNT CODE (optional)"}</label>
          <input
            type="text"
            value={discountCode}
            onChange={(e) => { setDiscountCode(e.target.value); setDiscountStatus(null); setDiscountData(null); }}
            onBlur={handleDiscountBlur}
            placeholder={isIt ? "Es. SUMMER10" : "E.g. SUMMER10"}
            style={{ ...styles.fieldInput, textTransform: "uppercase", letterSpacing: 2 }}
          />
          {discountStatus === "checking" && (
            <div style={{ fontSize: 11, color: "#5a5248", marginTop: 4 }}>
              {isIt ? "Verifica in corso..." : "Checking..."}
            </div>
          )}
          {discountStatus === "valid" && discountData && (
            <div style={{ fontSize: 11, color: "#4a7a4a", marginTop: 4, fontWeight: 600 }}>
              {discountData.discount_type === "percent"
                ? (isIt ? `✓ Sconto ${discountData.discount_value}% applicato` : `✓ ${discountData.discount_value}% discount applied`)
                : (isIt ? `✓ Sconto €${discountData.discount_value} applicato` : `✓ €${discountData.discount_value} discount applied`)}
            </div>
          )}
          {discountStatus === "invalid" && (
            <div style={{ fontSize: 11, color: "#a0522d", marginTop: 4 }}>
              {isIt ? "Codice non valido" : "Invalid code"}
            </div>
          )}
        </div>

        {/* Riepilogo costi */}
        {nights >= MIN_NIGHTS && (
          <div style={styles.priceBreakdown}>
            <div style={styles.priceRow}>
              <span>{isIt ? `Alloggio (${nights} notti)` : `Accommodation (${nights} nights)`}</span>
              <span style={{ color: "#5a5248", fontSize: 11 }}>{isIt ? "da verificare" : "to be confirmed"}</span>
            </div>
            {discountStatus === "valid" && discountData && (
              <div style={{ ...styles.priceRow, color: "#4a7a4a" }}>
                <span>
                  {discountData.discount_type === "percent"
                    ? (isIt ? `Sconto ${discountData.discount_value}%` : `Discount ${discountData.discount_value}%`)
                    : (isIt ? "Sconto fisso" : "Fixed discount")}
                </span>
                <span style={{ color: "#5a5248", fontSize: 11 }}>{isIt ? "calcolato al checkout" : "applied at checkout"}</span>
              </div>
            )}
            <div style={styles.priceRow}>
              <span>{isIt ? "Pulizie" : "Cleaning"}</span>
              <span>€{CLEANING_FEE}</span>
            </div>
            <div style={styles.priceRow}>
              <span>
                {isIt
                  ? `Tassa soggiorno (${taxablePersons} pers. × ${cityTaxNights} notti × €1,50)`
                  : `City tax (${taxablePersons} pers. × ${cityTaxNights} nights × €1.50)`}
              </span>
              <span>€{(cityTaxCents / 100).toFixed(2)}</span>
            </div>
          </div>
        )}

        {status === "minnights" && (
          <div style={{ color: "#a0522d", fontSize: 13, padding: "8px 0" }}>{t.bookMinNights}</div>
        )}
        {status === "unavailable" && (
          <div style={{ color: "#a0522d", fontSize: 13, padding: "8px 0" }}>
            {t.bookUnavailable}
            {debugMsg && <div style={{ fontSize: 11, marginTop: 4, color: "#888", wordBreak: "break-all" }}>{debugMsg}</div>}
          </div>
        )}
        {status === "error" && (
          <div style={{ color: "#a0522d", fontSize: 13, padding: "8px 0" }}>{t.bookError}</div>
        )}

        {/* Contact form — shown after availability confirmed */}
        {(status === "available" || status === "submitting") && availResult && (() => {
          const discountCents = calcDiscount(availResult.totalCents);
          const finalTotal = availResult.totalCents - discountCents + cityTaxCents + cleaningCents;
          return (
            <div style={{ borderTop: "1px solid #e0d8cc", paddingTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 13, color: "#4a7a4a", fontWeight: 600 }}>
                ✓ {isIt ? "Date disponibili" : "Dates available"}
              </div>
              <div style={styles.priceBreakdown}>
                <div style={styles.priceRow}>
                  <span>{isIt ? `Alloggio (${availResult.nights} notti)` : `Accommodation (${availResult.nights} nights)`}</span>
                  <span>€{(availResult.totalCents / 100).toFixed(2)}</span>
                </div>
                {discountCents > 0 && (
                  <div style={{ ...styles.priceRow, color: "#4a7a4a" }}>
                    <span>{isIt ? "Sconto" : "Discount"}</span>
                    <span>−€{(discountCents / 100).toFixed(2)}</span>
                  </div>
                )}
                <div style={styles.priceRow}>
                  <span>{isIt ? "Pulizie" : "Cleaning"}</span>
                  <span>€{CLEANING_FEE}</span>
                </div>
                <div style={styles.priceRow}>
                  <span>{isIt ? "Tassa soggiorno" : "City tax"}</span>
                  <span>€{(cityTaxCents / 100).toFixed(2)}</span>
                </div>
                <div style={{ ...styles.priceRow, fontWeight: 600, borderTop: "1px solid #e0d8cc", paddingTop: 8, marginTop: 4 }}>
                  <span>{isIt ? "Totale stimato" : "Estimated total"}</span>
                  <span>€{(finalTotal / 100).toFixed(2)}</span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#5a5248", fontStyle: "italic" }}>
                {isIt
                  ? "Lascia i tuoi contatti. Ti confermiamo la disponibilità entro 24h."
                  : "Leave your details. We'll confirm availability within 24 hours."}
              </div>
              <input
                type="text"
                placeholder={isIt ? "Nome e cognome *" : "Full name *"}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                style={styles.fieldInput}
              />
              <input
                type="email"
                placeholder={isIt ? "Email *" : "Email *"}
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                style={styles.fieldInput}
              />
              <input
                type="tel"
                placeholder={isIt ? "Telefono (opzionale)" : "Phone (optional)"}
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                style={styles.fieldInput}
              />
              <button
                onClick={handleRequest}
                disabled={!guestName || !guestEmail || status === "submitting"}
                style={{
                  ...styles.bookBtn,
                  opacity: (!guestName || !guestEmail || status === "submitting") ? 0.4 : 1,
                  cursor: (!guestName || !guestEmail || status === "submitting") ? "not-allowed" : "pointer",
                }}
              >
                {status === "submitting"
                  ? (isIt ? "Invio in corso..." : "Sending...")
                  : (isIt ? "Invia richiesta →" : "Send request →")}
              </button>
            </div>
          );
        })()}

        {status === "sent" && (
          <div style={{ borderTop: "1px solid #e0d8cc", paddingTop: 20 }}>
            <div style={{ fontSize: 15, color: "#4a7a4a", fontWeight: 600, marginBottom: 8 }}>
              ✓ {isIt ? "Richiesta inviata!" : "Request sent!"}
            </div>
            <div style={{ fontSize: 13, color: "#6b6156", lineHeight: 1.7 }}>
              {isIt
                ? "Abbiamo ricevuto la tua richiesta. Ti risponderemo entro 24 ore per confermare la disponibilità e i dettagli."
                : "We've received your request. We'll get back to you within 24 hours to confirm availability and details."}
            </div>
          </div>
        )}

        {status !== "available" && status !== "submitting" && status !== "sent" && (
          <button
            onClick={handleCheck}
            disabled={status === "checking" || !range.from || !range.to}
            style={{
              ...styles.bookBtn,
              opacity: (status === "checking" || !range.from || !range.to) ? 0.4 : 1,
              cursor: (status === "checking" || !range.from || !range.to) ? "not-allowed" : "pointer",
            }}
          >
            {status === "checking" ? t.bookChecking : t.bookBtn}
          </button>
        )}
      </div>
    </div>
  );
}

const globalCss = `
  .nav-desktop { display: flex !important; }
  .nav-mobile { display: none !important; }
  @media (max-width: 768px) {
    .nav-desktop { display: none !important; }
    .nav-mobile { display: flex !important; }
  }
`;

const calendarCss = `
  .rdp {
    --rdp-accent-color: #1a1a1a;
    --rdp-background-color: #e8e0d4;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    margin: 0;
  }
  .rdp-day:not([disabled]) .rdp-button,
  .rdp-button:not([disabled]) {
    background-color: #fff;
    color: #1a1a1a;
    font-weight: 500;
    border-radius: 0;
  }
  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
    background-color: #e8e0d4 !important;
    color: #1a1a1a !important;
  }
  .rdp-day_disabled {
    background-color: #c8a89a !important;
    color: #fff !important;
    text-decoration: line-through !important;
    opacity: 1 !important;
    cursor: not-allowed !important;
    border-radius: 0 !important;
  }
  .rdp-day_range_middle {
    background-color: #d4ccc0 !important;
    color: #1a1a1a !important;
    border-radius: 0 !important;
  }
  .rdp-day_range_start,
  .rdp-day_range_end {
    background-color: #1a1a1a !important;
    color: #f4efe8 !important;
    border-radius: 0 !important;
    font-weight: 600 !important;
  }
  .rdp-caption_label {
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 1px;
    color: #1a1a1a;
  }
  .rdp-head_cell {
    font-weight: 600;
    color: #8a7f72;
    font-size: 11px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
`;

// ─── HOME PAGE ───────────────────────────────────────────────────────────────

export default function Home({ lang, setLang, scrollY }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHero, setActiveHero] = useState(0);
  const [preloadedHero, setPreloadedHero] = useState(new Set([0, 1]));
  const mapRef = useRef(null);
  const [mapVisible, setMapVisible] = useState(false);
  const navigate = useNavigate();
  const t = T[lang] || T.en;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHero((i) => {
        const next = (i + 1) % HERO_IMAGES.length;
        setPreloadedHero((s) => new Set([...s, next, (next + 1) % HERO_IMAGES.length]));
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const el = mapRef.current;
    if (!el || !window.IntersectionObserver) { setMapVisible(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setMapVisible(true); obs.disconnect(); } },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const handleNav = (index) => {
    setMenuOpen(false);
    const map = {
      0: () => scrollTo("apartment"),
      1: () => scrollTo("sea"),
      2: () => scrollTo("position"),
      3: () => window.open("https://notuscany.com/pricing", "_blank"),
      4: () => scrollTo("booking"),
    };
    map[index]?.();
  };

  return (
    <div style={styles.page}>
      <HomeSEO lang={lang} />
      <style>{globalCss}</style>

      {/* NAV */}
      <nav style={{
        ...styles.nav,
        background: (scrollY > 60 || menuOpen) ? "rgba(244,239,232,0.97)" : "transparent",
        backdropFilter: (scrollY > 60 || menuOpen) ? "blur(20px)" : "none",
        borderBottom: (scrollY > 60 || menuOpen) ? "1px solid #c8bfb1" : "1px solid transparent",
      }}>
        <div style={styles.navInner}>
          <a href="https://notuscany.com" target="_blank" rel="noopener noreferrer" style={styles.logoLink}>
            <img
              src={(scrollY > 60 || menuOpen) ? "/images/notuscany-logo-light.png" : "/images/notuscany-logo.png"}
              alt="No Tuscany"
              width="280"
              height="98"
              style={styles.navLogo}
            />
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="nav-desktop">
            {t.nav.map((item, i) => (
              <span key={item} style={{ ...styles.navLink, color: (scrollY > 60 || menuOpen) ? "#1a1a1a" : "#fff" }} onClick={() => handleNav(i)}>{item}</span>
            ))}
            <div style={{ ...styles.langSwitch, borderColor: (scrollY > 60 || menuOpen) ? "#c8bfb1" : "rgba(255,255,255,0.5)" }}>
              {["IT", "EN"].map((l) => (
                <span key={l} onClick={() => setLang(l.toLowerCase())}
                  style={{ ...styles.langBtn, color: lang === l.toLowerCase() ? "#f4efe8" : ((scrollY > 60 || menuOpen) ? "#5a5248" : "rgba(255,255,255,0.7)"), ...(lang === l.toLowerCase() ? styles.langActive : {}) }}>
                  {l}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="nav-mobile">
            <div style={{ ...styles.langSwitch, borderColor: (scrollY > 60 || menuOpen) ? "#c8bfb1" : "rgba(255,255,255,0.5)" }}>
              {["IT", "EN"].map((l) => (
                <span key={l} onClick={() => setLang(l.toLowerCase())}
                  style={{ ...styles.langBtn, color: lang === l.toLowerCase() ? "#f4efe8" : ((scrollY > 60 || menuOpen) ? "#5a5248" : "rgba(255,255,255,0.7)"), ...(lang === l.toLowerCase() ? styles.langActive : {}) }}>
                  {l}
                </span>
              ))}
            </div>
            <button onClick={() => setMenuOpen((o) => !o)} style={{ ...styles.hamburger, color: (scrollY > 60 || menuOpen) ? "#1a1a1a" : "#fff" }} aria-label="Menu">
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={styles.mobileMenu}>
            {t.nav.map((item, i) => (
              <span key={item} style={styles.mobileNavLink} onClick={() => handleNav(i)}>{item}</span>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="hero" style={styles.hero}>
        {/* Slideshow images — lazy: only current + next are loaded */}
        {HERO_IMAGES.map((src, i) =>
          preloadedHero.has(i) ? (
            <img
              key={src}
              src={src}
              alt=""
              style={{
                ...styles.heroImg,
                opacity: i === activeHero ? 1 : 0,
              }}
            />
          ) : null
        )}
        {/* Dark overlay for text readability */}
        <div style={styles.heroOverlay} />
        {/* Content */}
        <div style={styles.heroContent}>
          <div style={styles.heroSub}>{t.heroSub}</div>
          <h1 style={styles.heroTitle}>Cala di Forno</h1>
          <p style={styles.heroTagline}>
            {t.heroTagline1}<br /><em style={{ fontStyle: "italic" }}>{t.heroTagline2}</em>
          </p>
          <div style={styles.heroDetails}>{t.heroDetails}</div>
          <button style={styles.heroCta} onClick={() => scrollTo("booking")}>{t.heroCta}</button>
          {/* Dot indicators */}
          <div style={styles.heroDots}>
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveHero(i);
                  setPreloadedHero((s) => new Set([...s, i, (i + 1) % HERO_IMAGES.length]));
                }}
                style={{ ...styles.heroDot, opacity: i === activeHero ? 1 : 0.35 }}
                aria-label={`Foto ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ESSENCE */}
      <section style={styles.essenceSection}>
        <div style={styles.essenceGrid}>
          {[50, 100, 1, 0].map((n, i) => (
            <div key={i}>
              <div style={styles.essenceNumber}>{n}</div>
              <div style={styles.essenceLabel}>{t.essLabels[i]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* APARTMENT */}
      <section id="apartment" style={{ padding: "100px 0 0" }}>
        <div style={{ ...styles.sectionInner, padding: "0 24px 48px" }}>
          <div style={styles.sectionLabel}>{t.aptSection}</div>
          <h2 style={{ ...styles.sectionTitle, marginBottom: 24 }}>{t.aptTitle}</h2>
          <div style={styles.aptTagline}>{t.apt.tagline}</div>
          <div style={{ ...styles.aptMeta, marginTop: 16 }}>
            <span>{t.apt.beds}</span>
            <span style={styles.aptSqm}>{APARTMENT.sqm} m²</span>
          </div>
          <div style={{ ...styles.aptFeatures, marginTop: 16 }}>
            {t.apt.features.map((f, i) => <span key={i} style={styles.aptFeature}>{f}</span>)}
          </div>
        </div>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
          <AptSlideshow images={APT_IMAGES} />
        </div>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px 80px" }}>
          <button style={styles.aptCta} onClick={() => navigate("/appartamenti/cala")}>
            {t.aptCta}
          </button>
        </div>
      </section>

      {/* SEA */}
      <section id="sea" style={{ overflow: "hidden" }}>
        <div style={styles.seaPhotos}>
          <img src="/images/hero1.jpg" alt="Il mare di Talamone" style={styles.seaPhoto} />
          <img src="/images/hero2.jpg" alt="Cala di Forno" style={styles.seaPhoto} />
        </div>
        <div style={{ background: "#1a2a38", padding: "100px 24px 100px", marginTop: 4 }}>
          <div style={styles.sectionInner}>
            <div style={{ ...styles.sectionLabel, color: "#10B981" }}>{t.seaLabel}</div>
            <h2 style={{ ...styles.sectionTitle, color: "#f4efe8", marginBottom: 24 }}>{t.seaTitle}</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#a89e91", fontSize: 16, maxWidth: 540, lineHeight: 1.8 }}>
              {t.seaDesc}
            </p>
          </div>
        </div>
      </section>

      {/* POSITION */}
      <section id="position" style={{ ...styles.section, background: "#1a1a1a" }}>
        <div style={styles.sectionInner}>
          <div style={{ ...styles.sectionLabel, color: "#a89e91" }}>{t.posLabel}</div>
          <h2 style={{ ...styles.sectionTitle, color: "#f4efe8" }}>{t.posTitle1}<br />{t.posTitle2}</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#a89e91", fontSize: 16, maxWidth: 600, lineHeight: 1.7, marginBottom: 48 }}>
            {t.posDesc}
          </p>
          <div style={styles.citiesGrid}>
            {CITY_NAMES.map((name, i) => (
              <div key={name} style={styles.cityRow}>
                <div style={styles.cityName}>{name}</div>
                <div style={styles.cityDots} />
                <div style={styles.cityKm}>{CITY_KM[i]} km</div>
                <div style={styles.cityHighlight}>{t.cities[i].highlight}</div>
              </div>
            ))}
          </div>
        </div>

        <div ref={mapRef} style={styles.mapWrapper}>
          <iframe
            title="Cala di Forno — Talamone"
            src={mapVisible ? "https://www.openstreetmap.org/export/embed.html?bbox=11.10%2C42.52%2C11.18%2C42.59&layer=mapnik&marker=42.5524%2C11.1362" : undefined}
            style={styles.mapIframe}
          />
          <a
            href="https://www.openstreetmap.org/?mlat=42.5524&mlon=11.1362#map=14/42.5524/11.1362"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.mapCredit}
          >
            OpenStreetMap →
          </a>
        </div>
      </section>

      {/* NO TUSCANY NETWORK */}
      <section style={{ padding: "80px 24px", borderTop: "1px solid #c8bfb1", borderBottom: "1px solid #c8bfb1" }}>
        <div style={{ ...styles.sectionInner, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 4, color: "#5a5248", marginBottom: 16 }}>NETWORK</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>NO TUSCANY</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontStyle: "italic", color: "#6b6156", marginBottom: 24 }}>The Local Insider</div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#4a4039", lineHeight: 1.8, marginBottom: 16 }}>{t.netIntro}</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, lineHeight: 1.5, marginBottom: 24 }}>
              Say <strong style={{ fontWeight: 600 }}>NO</strong> to platforms.<br />
              Say <strong style={{ fontWeight: 600 }}>KNOW</strong> to locals.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#6b6156", lineHeight: 1.8 }}>{t.netDesc}</p>
          </div>
          <div style={{ background: "#1a1a1a", padding: 40, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 4, color: "#a89e91" }}>{t.netGuests}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: "#f4efe8" }}>Mi Manda Duccio</div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#a89e91", lineHeight: 1.8 }}>{t.netGuide}</p>
            <a href="https://notuscany.com" target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, letterSpacing: 2, color: "#f4efe8", borderBottom: "1px solid #f4efe8", paddingBottom: 2, textDecoration: "none", alignSelf: "flex-start" }}>
              {t.netLink}
            </a>
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking" style={styles.section}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionLabel}>{t.bookLabel}</div>
          <h2 style={styles.sectionTitle}>{t.bookTitle}</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6b6156", fontSize: 16, maxWidth: 500, lineHeight: 1.7, marginBottom: 40 }}>
            {t.bookDesc}
          </p>
          <BookingWidget t={t} lang={lang} />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div>
            <div style={styles.footerLogo}>CALA DI FORNO</div>
            <div style={styles.footerSub}>Talamone · {t.footerPlace}</div>
          </div>
          <div style={styles.footerContact}>
            <div>info@notuscany.com</div>
            <div>+39 351 735 2679</div>
            <a href="https://wa.me/393517352679" target="_blank" rel="noopener noreferrer" style={styles.whatsappBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
          <div style={styles.footerBottom}>
            <div style={{ marginBottom: 12 }}>© {new Date().getFullYear()} Cala di Forno — Talamone</div>
            <a
              href="https://www.trustpilot.com/review/notuscany.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 16, textDecoration: "none", color: "#a89e91", fontSize: 12, letterSpacing: 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#00b67a" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l2.9 8.9H24l-7.5 5.5 2.9 8.9L12 20l-7.4 5.3 2.9-8.9L0 10.9h9.1z"/>
              </svg>
              Review us on Trustpilot
            </a>
            <div style={{ fontSize: 10, letterSpacing: 1, lineHeight: 1.8, color: "#a89e91" }}>
              CIN Cala di Forno: IT000000000000000000
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = {
  page: { background: "#f4efe8", color: "#1a1a1a", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", overflowX: "hidden" },

  nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, transition: "all 0.3s ease", padding: "0 24px" },
  navInner: { maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 },
  logoLink: { display: "flex", alignItems: "center", textDecoration: "none" },
  hamburger: { background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#1a1a1a", padding: "4px 8px", lineHeight: 1 },
  mobileMenu: { display: "flex", flexDirection: "column", gap: 0, borderTop: "1px solid #e0d8cc", padding: "8px 0 16px" },
  mobileNavLink: { fontSize: 14, letterSpacing: 1.5, cursor: "pointer", color: "#1a1a1a", padding: "14px 24px", fontFamily: "'DM Sans', sans-serif", borderBottom: "1px solid #f0ebe3" },
  navLogo: { height: 36, width: "auto", display: "block", transition: "opacity 0.3s ease" },
  navLink: { fontSize: 13, letterSpacing: 1, cursor: "pointer", borderBottom: "1px solid transparent", paddingBottom: 2, transition: "border-color 0.2s", fontWeight: 400 },
  langSwitch: { display: "flex", gap: 0, border: "1px solid #c8bfb1", marginLeft: 8 },
  langBtn: { padding: "4px 10px", fontSize: 11, letterSpacing: 1, cursor: "pointer", transition: "all 0.2s", color: "#5a5248" },
  langActive: { background: "#1a1a1a", color: "#f4efe8" },

  hero: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", background: "#1a1a1a", padding: "0 24px", textAlign: "center", overflow: "hidden" },
  heroImg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "opacity 1.2s ease", zIndex: 0 },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.65) 100%)", zIndex: 1, pointerEvents: "none" },
  heroContent: { position: "relative", zIndex: 2 },
  heroDots: { display: "flex", justifyContent: "center", gap: 10, marginTop: 32 },
  heroDot: { width: 8, height: 8, borderRadius: "50%", background: "#f4efe8", border: "none", cursor: "pointer", padding: 0, transition: "opacity 0.3s ease" },
  heroSub: { fontSize: 12, letterSpacing: 4, color: "#D62626", marginBottom: 24, textTransform: "uppercase" },
  heroTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(48px, 10vw, 120px)", fontWeight: 300, color: "#f4efe8", letterSpacing: -1, lineHeight: 0.95, marginBottom: 24, textShadow: "0 2px 20px rgba(0,0,0,0.5)" },
  heroTagline: { fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 300, color: "#e8e0d8", lineHeight: 1.4, marginBottom: 32, textShadow: "0 1px 10px rgba(0,0,0,0.5)" },
  heroDetails: { fontSize: 13, color: "#10B981", letterSpacing: 1, marginBottom: 40 },
  heroCta: { background: "transparent", color: "#f4efe8", border: "1px solid #f4efe8", padding: "14px 36px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, letterSpacing: 2, cursor: "pointer", transition: "all 0.3s ease" },

  essenceSection: { padding: "80px 24px", borderBottom: "1px solid #c8bfb1" },
  essenceGrid: { maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 40, textAlign: "center" },
  essenceNumber: { fontFamily: "'Cormorant Garamond', serif", fontSize: 56, fontWeight: 300, lineHeight: 1, marginBottom: 8 },
  essenceLabel: { fontSize: 13, color: "#6b6156", letterSpacing: 1 },

  section: { padding: "100px 24px" },
  sectionInner: { maxWidth: 1000, margin: "0 auto" },
  sectionLabel: { fontSize: 11, letterSpacing: 4, color: "#5a5248", marginBottom: 16, textTransform: "uppercase" },
  sectionTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, lineHeight: 1.2, marginBottom: 48, color: "#1a1a1a" },

  aptDetail: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" },
  aptDetailImg: { width: "100%", height: 360, objectFit: "cover", display: "block" },
  aptDetailBody: { display: "flex", flexDirection: "column", gap: 16 },
  aptTagline: { fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, fontStyle: "italic", color: "#2a2218", lineHeight: 1.5 },
  aptMeta: { fontSize: 13, color: "#6b6156", display: "flex", justifyContent: "space-between", paddingBottom: 16, borderBottom: "1px solid #e0d8cc" },
  aptSqm: { fontWeight: 500 },
  aptFeatures: { display: "flex", flexWrap: "wrap", gap: 8 },
  aptFeature: { fontSize: 11, letterSpacing: 1, padding: "4px 10px", border: "1px solid #d4ccc0", color: "#6b6156" },
  aptCta: { background: "transparent", border: "1px solid #1a1a1a", color: "#1a1a1a", padding: "12px 28px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, letterSpacing: 2, cursor: "pointer", alignSelf: "flex-start", transition: "all 0.3s ease" },

  seaPhotos: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, width: "100%", height: 480 },
  seaPhoto: { width: "100%", height: "100%", objectFit: "cover", display: "block" },

  mapWrapper: { position: "relative", marginTop: 60, height: 420 },
  mapIframe: { width: "100%", height: "100%", border: "none", display: "block", filter: "grayscale(30%) contrast(1.05) brightness(0.9)" },
  mapCredit: { position: "absolute", bottom: 8, right: 8, fontSize: 10, color: "#a89e91", textDecoration: "none", letterSpacing: 1, fontFamily: "'DM Sans', sans-serif", background: "rgba(26,26,26,0.7)", padding: "3px 8px" },

  citiesGrid: { display: "flex", flexDirection: "column" },
  cityRow: { display: "grid", gridTemplateColumns: "160px 1fr 60px 1fr", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: "1px solid #2a2a2a" },
  cityName: { fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: "#f4efe8" },
  cityDots: { borderBottom: "1px dotted #444", height: 1 },
  cityKm: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#a89e91", textAlign: "right" },
  cityHighlight: { fontSize: 13, color: "#a89e91", fontStyle: "italic" },

  bookingWidget: { border: "1px solid #1a1a1a", padding: 40, maxWidth: 720 },
  bookingTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, marginBottom: 32 },
  bookingFields: { display: "flex", flexDirection: "column", gap: 20 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: 11, letterSpacing: 2, color: "#5a5248", textTransform: "uppercase" },
  fieldInput: { border: "none", borderBottom: "1px solid #c8bfb1", background: "transparent", padding: "10px 0", fontSize: 16, outline: "none", fontFamily: "'DM Sans', sans-serif", color: "#1a1a1a" },
  calendarWrapper: { borderTop: "1px solid #e0d8cc", borderBottom: "1px solid #e0d8cc", padding: "20px 0", position: "relative" },
  calendarLoading: { fontSize: 12, color: "#5a5248", letterSpacing: 1, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" },
  calendarLegend: { display: "flex", gap: 20, marginTop: 12, marginBottom: 4, flexWrap: "wrap" },
  legendItem: { display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "#5a5248", fontFamily: "'DM Sans', sans-serif", letterSpacing: 1 },
  legendDot: { width: 14, height: 14, flexShrink: 0 },
  rangeLabel: { fontSize: 13, color: "#4a4039", fontFamily: "'DM Sans', sans-serif", marginTop: 12, paddingTop: 12, borderTop: "1px solid #e0d8cc" },
  priceBreakdown: { marginTop: 12, padding: "14px 16px", background: "#f9f6f1", border: "1px solid #e0d8cc", display: "flex", flexDirection: "column", gap: 8 },
  priceRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#4a4039", fontFamily: "'DM Sans', sans-serif", gap: 12 },
  bookBtn: { marginTop: 12, background: "#1a1a1a", color: "#f4efe8", border: "1px solid #1a1a1a", padding: "14px 36px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, letterSpacing: 2, cursor: "pointer", transition: "all 0.3s ease", alignSelf: "flex-start" },

  footer: { borderTop: "1px solid #c8bfb1", padding: "60px 24px" },
  footerInner: { maxWidth: 1000, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 32 },
  footerLogo: { fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, letterSpacing: 4, marginBottom: 4 },
  footerSub: { fontSize: 12, color: "#5a5248" },
  footerContact: { fontSize: 13, color: "#6b6156", lineHeight: 1.8 },
  whatsappBtn: { display: "inline-flex", alignItems: "center", gap: 8, marginTop: 12, padding: "10px 20px", background: "#25D366", color: "#fff", textDecoration: "none", fontSize: 13, letterSpacing: 1, fontFamily: "'DM Sans', sans-serif" },
  footerBottom: { width: "100%", fontSize: 11, color: "#5a5248", marginTop: 24, paddingTop: 24, borderTop: "1px solid #e0d8cc" },
};

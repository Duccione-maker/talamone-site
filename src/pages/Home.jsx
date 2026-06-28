import { useState, useEffect, useRef } from "react";
// @stripe/stripe-js not needed — redirect via session.url
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { HomeSEO } from "../components/SEO";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { APARTMENTS, APT_IDS, APT_NAMES, APT_SQMS } from "../data/apartments";

// Stripe redirect handled via session.url (no frontend SDK needed)

const PHOTOS = {
  hero: "/images/hero.jpg",
  fienile: "/images/fienile.jpg",
  ghiri: "/images/ghiri.jpg",
  nidi: "/images/nidi.jpg",
  padronale: "/images/padronale.jpg",
};

// ─── TRANSLATIONS ───────────────────────────────────────────────────────────

const T = {
  it: {
    nav: ["Appartamenti", "Piscina", "Posizione", "Tips", "Prenota"],
    heroSub: "San Gimignano · Chianti · Toscana",
    heroTagline1: "Non un alloggio.",
    heroTagline2: "Un luogo.",
    heroDetails: "4 appartamenti · piscina · 250 olivi · nel cuore della Toscana",
    heroCta: "Prenota direttamente →",
    essLabels: ["olivi", "appartamenti indipendenti", "piscina panoramica", "compromessi"],
    aptSection: "GLI SPAZI",
    aptTitle: "Quattro modi di abitare la Toscana",
    aptCta: "Scopri e prenota →",
    poolLabel: "LA PISCINA",
    poolTitle: "Vista sulle colline. Silenzio tutto intorno.",
    poolDesc:
      "La piscina di La Ripa si affaccia sui vigneti del Chianti e sull'oliveto. Panoramica, silenziosa, lontana da tutto. Un posto dove il tempo si ferma.",
    greenLabel: "OSPITALITÀ SOSTENIBILE",
    greenTitle1: "Energia dal sole.",
    greenTitle2: "Calore dalla terra.",
    greenItems: ["impianto fotovoltaico", "accumulo a batteria", "pompe di calore"],
    greenNote:
      "Zero gas. Riscaldamento, acqua calda e climatizzazione interamente da fonti rinnovabili.",
    posLabel: "POSIZIONE STRATEGICA",
    posTitle1: "Al centro di tutto.",
    posTitle2: "Lontano da tutto.",
    posDesc:
      "La Ripa è il punto di partenza perfetto per esplorare le città d'arte della Toscana. Tutto a portata di mano, niente a portata d'orecchio.",
    netIntro: "La Ripa fa parte del network No Tuscany. La nostra filosofia è semplice:",
    netDesc:
      "Niente algoritmi, niente recensioni anonime. Solo una conoscenza vera del territorio, costruita in anni di vita qui. Chi prenota a La Ripa accede a un modo diverso di vivere la Toscana.",
    netGuests: "PER I NOSTRI OSPITI",
    netGuide:
      "La guida interattiva riservata agli ospiti La Ripa. Ristoranti, artigiani, esperienze — solo posti selezionati personalmente, dove il tuo nome apre porte.",
    netLink: "Scopri No Tuscany →",
    bookLabel: "PRENOTA",
    bookTitle: "Direttamente. Senza intermediari.",
    bookDesc:
      "Prenota qui per il miglior prezzo garantito. Nessuna commissione, nessuna piattaforma. Solo tu e La Ripa.",
    bookWidget: "Prenota",
    bookGuests: "Ospiti",
    bookApt: "Appartamento",
    bookBtn: "Prenota e paga →",
    bookChecking: "Verifica disponibilità...",
    bookUnavailable: "Date non disponibili. Prova altre date.",
    bookMinNights: "Soggiorno minimo 5 notti.",
    bookError: "Errore. Riprova o contattaci su WhatsApp.",
    footerPlace: "Toscana",
    apartments: APARTMENTS.map((a) => a.it),
    cities: [
      { highlight: "Torri medievali, Vernaccia, borgo" },
      { highlight: "Cristallo, centro storico" },
      { highlight: "Boccaccio, borgo medievale" },
      { highlight: "Piazza del Campo, Duomo, Palio" },
      { highlight: "Uffizi, Ponte Vecchio, Duomo" },
      { highlight: "Mura medievali, via Francigena" },
    ],
  },
  en: {
    nav: ["Apartments", "Pool", "Location", "Tips", "Book"],
    heroSub: "San Gimignano · Chianti · Tuscany",
    heroTagline1: "Not accommodation.",
    heroTagline2: "A place.",
    heroDetails: "4 apartments · pool · 250 olive trees · in the heart of Tuscany",
    heroCta: "Book directly →",
    essLabels: ["olive trees", "independent apartments", "panoramic pool", "compromises"],
    aptSection: "THE SPACES",
    aptTitle: "Four ways to live Tuscany",
    aptCta: "Explore & book →",
    poolLabel: "THE POOL",
    poolTitle: "Hills on the horizon. Silence all around.",
    poolDesc:
      "La Ripa's pool overlooks the Chianti vineyards and the olive grove. Panoramic, quiet, far from everything. A place where time stands still.",
    greenLabel: "SUSTAINABLE HOSPITALITY",
    greenTitle1: "Energy from the sun.",
    greenTitle2: "Warmth from the earth.",
    greenItems: ["solar panel system", "battery storage", "heat pumps"],
    greenNote:
      "Zero gas. Heating, hot water, and air conditioning entirely from renewable sources.",
    posLabel: "STRATEGIC LOCATION",
    posTitle1: "At the centre of everything.",
    posTitle2: "Far from everything.",
    posDesc:
      "La Ripa is the perfect base to explore Tuscany's art cities. Everything within reach, nothing within earshot.",
    netIntro: "La Ripa is part of the No Tuscany network. Our philosophy is simple:",
    netDesc:
      "No algorithms, no anonymous reviews. Just real knowledge of the territory, built over years of living here. Guests at La Ripa get access to a different way of experiencing Tuscany.",
    netGuests: "FOR OUR GUESTS",
    netGuide:
      "The interactive guide reserved for La Ripa guests. Restaurants, artisans, experiences — only personally selected spots, where your name opens doors.",
    netLink: "Discover No Tuscany →",
    bookLabel: "BOOK",
    bookTitle: "Directly. No middlemen.",
    bookDesc:
      "Book here for the best guaranteed price. No commission, no platforms. Just you and La Ripa.",
    bookWidget: "Book",
    bookGuests: "Guests",
    bookApt: "Apartment",
    bookBtn: "Book & pay →",
    bookChecking: "Checking availability...",
    bookUnavailable: "Dates not available. Try different dates.",
    bookMinNights: "Minimum stay is 5 nights.",
    bookError: "Error. Please retry or contact us on WhatsApp.",
    footerPlace: "Tuscany",
    apartments: APARTMENTS.map((a) => a.en),
    cities: [
      { highlight: "Medieval towers, Vernaccia, hilltop village" },
      { highlight: "Crystal, historic centre" },
      { highlight: "Boccaccio, medieval village" },
      { highlight: "Piazza del Campo, Duomo, Palio" },
      { highlight: "Uffizi, Ponte Vecchio, Duomo" },
      { highlight: "Medieval walls, Via Francigena" },
    ],
  },
};

const CITY_NAMES = ["San Gimignano", "Colle Val d'Elsa", "Certaldo", "Siena", "Firenze", "Monteriggioni"];
const CITY_KM = [5, 14, 18, 42, 52, 30];

// ─── BOOKING WIDGET ──────────────────────────────────────────────────────────

function BookingWidget({ t, preselected }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const aptFromUrl = searchParams.get("apt");
  const initialApt = (aptFromUrl && APT_IDS.includes(aptFromUrl)) ? aptFromUrl : (preselected || "fienile");

  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [adults, setAdults] = useState(2);
  const [childAges, setChildAges] = useState([]); // array di numeri (età 0–17) per ogni bambino
  const [apartment, setApartment] = useState(initialApt);
  const [status, setStatus] = useState(null);
  const [debugMsg, setDebugMsg] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountStatus, setDiscountStatus] = useState(null); // null | "checking" | "valid" | "invalid"
  const [discountData, setDiscountData] = useState(null); // { discount_type, discount_value }

  // Reset stuck "checking" status when user navigates back from Stripe
  useEffect(() => {
    const handlePageShow = () => setStatus((s) => s === "checking" ? null : s);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") handlePageShow();
    };
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Fetch blocked dates whenever apartment changes
  useEffect(() => {
    if (preselected) setApartment(preselected);
  }, [preselected]);

  useEffect(() => {
    setLoadingDates(true);
    setRange({ from: undefined, to: undefined });
    setStatus(null);
    fetch(`/.netlify/functions/get-blocked-dates?apartment=${apartment}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.blocked) {
          setBlockedDates(data.blocked.map((d) => new Date(d + "T12:00:00")));
        }
      })
      .catch(() => setBlockedDates([]))
      .finally(() => setLoadingDates(false));
  }, [apartment]);

  const checkIn = range.from ? range.from.toISOString().slice(0, 10) : "";
  const checkOut = range.to ? range.to.toISOString().slice(0, 10) : "";

  const MIN_NIGHTS = 5;

  const handleBook = async () => {
    if (!checkIn || !checkOut) return;
    if (nights < MIN_NIGHTS) {
      setStatus("minnights");
      return;
    }
    setStatus("checking");
    try {
      const availRes = await fetch("/.netlify/functions/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartment, checkIn, checkOut }),
      });
      const availData = await availRes.json();

      if (!availData.available) {
        console.warn("check-availability returned unavailable:", availData);
        setStatus("unavailable");
        setDebugMsg(JSON.stringify(availData));
        return;
      }

      const discountCents = calcDiscount(availData.totalCents);
      const finalTotal = availData.totalCents - discountCents + cityTaxCents + cleaningCents;
      const checkoutRes = await fetch("/.netlify/functions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apartment,
          checkIn,
          checkOut,
          guests: totalGuests,
          nights: availData.nights,
          totalCents: finalTotal,
          cityTaxCents,
          cleaningCents,
          discountCode: discountStatus === "valid" ? discountCode.trim().toUpperCase() : "",
        }),
      });
      const checkoutData = await checkoutRes.json();

      if (checkoutData.error || !checkoutData.url) {
        console.error("create-checkout problem:", checkoutData);
        setDebugMsg(JSON.stringify(checkoutData));
        setStatus("error");
        return;
      }

      window.location.href = checkoutData.url;
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

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

  const otherApts = APARTMENTS.filter((a) => a.id !== apartment);
  const lang = t === T?.it ? "it" : "en";

  // Discount calculation (applied to accommodation only, not fees)
  const calcDiscount = (accommodationCents) => {
    if (!discountData || discountStatus !== "valid") return 0;
    if (discountData.discount_type === "percent") {
      return Math.round(accommodationCents * discountData.discount_value / 100);
    }
    return Math.min(Math.round(discountData.discount_value * 100), accommodationCents);
  };

  const handleDiscountBlur = async () => {
    const code = discountCode.trim().toUpperCase();
    if (!code) { setDiscountStatus(null); setDiscountData(null); return; }
    setDiscountStatus("checking");
    try {
      const res = await fetch("/.netlify/functions/verify-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, apartment }),
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

  return (
    <div>
      <div style={styles.bookingWidget}>
        <div style={styles.bookingTitle}>{t.bookWidget}</div>
        <div style={styles.bookingFields}>

        {/* Apartment selector */}
        <div style={styles.fieldGroup}>
          <label style={styles.fieldLabel}>{t.bookApt}</label>
          <select value={apartment} onChange={(e) => setApartment(e.target.value)} style={styles.fieldInput}>
            {APT_NAMES.map((name, i) => (
              <option key={APT_IDS[i]} value={APT_IDS[i]}>{name}</option>
            ))}
          </select>
        </div>

        {/* Calendar */}
        <div style={styles.calendarWrapper}>
          {loadingDates && (
            <div style={styles.calendarLoading}>
              {t.calendarLoading || "Caricamento disponibilità..."}
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
          {/* Legenda */}
          <div style={styles.calendarLegend}>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, background: "#fff", border: "1px solid #c8bfb1" }} />
              <span>{lang === "it" ? "Disponibile" : "Available"}</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, background: "#c8a89a" }} />
              <span>{lang === "it" ? "Occupato" : "Unavailable"}</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, background: "#1a1a1a" }} />
              <span>{lang === "it" ? "Selezionato" : "Selected"}</span>
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
                  {lang === "it" ? "(min. 5 notti)" : "(min. 5 nights)"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Ospiti */}
        <div style={styles.fieldGroup}>
          <label style={styles.fieldLabel}>{lang === "it" ? "ADULTI" : "ADULTS"}</label>
          <select value={adults} onChange={(e) => setAdults(Number(e.target.value))} style={styles.fieldInput}>
            {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.fieldLabel}>{lang === "it" ? "BAMBINI" : "CHILDREN"}</label>
          <select
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
            {[0,1,2,3,4].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {childAges.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 10, letterSpacing: 1.5, color: "#8a7f72", fontFamily: "'DM Sans', sans-serif" }}>
              {lang === "it" ? "ETÀ DEI BAMBINI" : "CHILDREN'S AGES"}
            </div>
            {childAges.map((age, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "#4a4039", width: 75, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
                  {lang === "it" ? `Bambino ${i + 1}` : `Child ${i + 1}`}
                </span>
                <select
                  value={age}
                  onChange={(e) => {
                    const next = [...childAges];
                    next[i] = Number(e.target.value);
                    setChildAges(next);
                  }}
                  style={{ ...styles.fieldInput, flex: 1, fontSize: 12 }}
                >
                  {Array.from({ length: 18 }, (_, a) => (
                    <option key={a} value={a}>
                      {a === 0 ? (lang === "it" ? "< 1 anno" : "< 1 year") : `${a} ${lang === "it" ? "anni" : "years"}`}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: 10, color: age >= 14 ? "#a0522d" : "#8a7f72", fontFamily: "'DM Sans', sans-serif", width: 60, textAlign: "right" }}>
                  {age >= 14
                    ? (lang === "it" ? "tassa sì" : "tax applies")
                    : (lang === "it" ? "esentato" : "exempt")}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Codice sconto */}
        <div style={styles.fieldGroup}>
          <label style={styles.fieldLabel}>{lang === "it" ? "CODICE SCONTO (opzionale)" : "DISCOUNT CODE (optional)"}</label>
          <input
            type="text"
            value={discountCode}
            onChange={(e) => { setDiscountCode(e.target.value); setDiscountStatus(null); setDiscountData(null); }}
            onBlur={handleDiscountBlur}
            placeholder={lang === "it" ? "Es. SUMMER10" : "E.g. SUMMER10"}
            style={{ ...styles.fieldInput, textTransform: "uppercase", letterSpacing: 2 }}
          />
          {discountStatus === "checking" && (
            <div style={{ fontSize: 11, color: "#8a7f72", marginTop: 4 }}>
              {lang === "it" ? "Verifica in corso..." : "Checking..."}
            </div>
          )}
          {discountStatus === "valid" && discountData && (
            <div style={{ fontSize: 11, color: "#4a7a4a", marginTop: 4, fontWeight: 600 }}>
              {discountData.discount_type === "percent"
                ? (lang === "it" ? `✓ Sconto ${discountData.discount_value}% applicato` : `✓ ${discountData.discount_value}% discount applied`)
                : (lang === "it" ? `✓ Sconto €${discountData.discount_value} applicato` : `✓ €${discountData.discount_value} discount applied`)}
            </div>
          )}
          {discountStatus === "invalid" && (
            <div style={{ fontSize: 11, color: "#a0522d", marginTop: 4 }}>
              {lang === "it" ? "Codice non valido" : "Invalid code"}
              {discountData && <span style={{ color: "#bbb", marginLeft: 6 }}>({discountData})</span>}
            </div>
          )}
        </div>

        {/* Riepilogo costi */}
        {nights >= MIN_NIGHTS && (
          <div style={styles.priceBreakdown}>
            <div style={styles.priceRow}>
              <span>{lang === "it" ? `Alloggio (${nights} notti)` : `Accommodation (${nights} nights)`}</span>
              <span style={{ color: "#8a7f72", fontSize: 11 }}>{lang === "it" ? "da verificare" : "to be confirmed"}</span>
            </div>
            {discountStatus === "valid" && discountData && (
              <div style={{ ...styles.priceRow, color: "#4a7a4a" }}>
                <span>
                  {discountData.discount_type === "percent"
                    ? (lang === "it" ? `Sconto ${discountData.discount_value}%` : `Discount ${discountData.discount_value}%`)
                    : (lang === "it" ? "Sconto fisso" : "Fixed discount")}
                </span>
                <span style={{ color: "#8a7f72", fontSize: 11 }}>{lang === "it" ? "calcolato al checkout" : "applied at checkout"}</span>
              </div>
            )}
            <div style={styles.priceRow}>
              <span>{lang === "it" ? "Pulizie" : "Cleaning"}</span>
              <span>€{CLEANING_FEE}</span>
            </div>
            <div style={styles.priceRow}>
              <span>
                {lang === "it"
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
          <div style={{ color: "#a0522d", fontSize: 13, padding: "8px 0" }}>{t.bookError}
            {debugMsg && <div style={{ fontSize: 11, marginTop: 4, color: "#888", wordBreak: "break-all" }}>{debugMsg}</div>}
          </div>
        )}

        <button
          onClick={handleBook}
          disabled={status === "checking" || !range.from || !range.to}
          style={{
            ...styles.bookBtn,
            opacity: (status === "checking" || !range.from || !range.to) ? 0.4 : 1,
            cursor: (status === "checking" || !range.from || !range.to) ? "not-allowed" : "pointer",
          }}
        >
          {status === "checking" ? t.bookChecking : t.bookBtn}
        </button>
      </div>
      </div>

      {/* Carosello altri appartamenti — sempre visibile */}
      <div style={styles.altAptsWrapper}>
        <div style={styles.altAptsLabel}>
          {lang === "it" ? "OPPURE GUARDA GLI ALTRI APPARTAMENTI" : "OR EXPLORE THE OTHER APARTMENTS"}
        </div>
        <div style={styles.altAptsRow}>
          {otherApts.map((a) => (
            <button
              key={a.id}
              style={{
                ...styles.altAptCard,
                ...(apartment === a.id ? styles.altAptCardActive : {}),
              }}
              onClick={() => {
                setApartment(a.id);
                setRange({ from: undefined, to: undefined });
                setStatus(null);
              }}
            >
              <img src={a.photo} alt={a.name} style={styles.altAptImg} />
              <div style={styles.altAptName}>{a.name}</div>
              <div style={styles.altAptSub}>
                {a[lang === "it" ? "it" : "en"].beds}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Calendar CSS override — integra la palette La Ripa
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

  /* Giorni LIBERI — sfondo bianco caldo, testo scuro, ben leggibili */
  .rdp-day:not([disabled]) .rdp-button,
  .rdp-button:not([disabled]) {
    background-color: #fff;
    color: #1a1a1a;
    font-weight: 500;
    border-radius: 0;
  }

  /* Hover su giorni liberi */
  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
    background-color: #e8e0d4 !important;
    color: #1a1a1a !important;
  }

  /* Giorni OCCUPATI — sfondo rosso mattone opaco, testo chiaro, barrati */
  .rdp-day_disabled {
    background-color: #c8a89a !important;
    color: #fff !important;
    text-decoration: line-through !important;
    opacity: 1 !important;
    cursor: not-allowed !important;
    border-radius: 0 !important;
  }

  /* Range selezionato — sfondo medio */
  .rdp-day_range_middle {
    background-color: #d4ccc0 !important;
    color: #1a1a1a !important;
    border-radius: 0 !important;
  }

  /* Inizio e fine range — nero pieno */
  .rdp-day_range_start,
  .rdp-day_range_end {
    background-color: #1a1a1a !important;
    color: #f4efe8 !important;
    border-radius: 0 !important;
    font-weight: 600 !important;
  }

  /* Intestazioni mesi */
  .rdp-caption_label {
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 1px;
    color: #1a1a1a;
  }

  /* Giorni della settimana */
  .rdp-head_cell {
    font-weight: 600;
    color: #8a7f72;
    font-size: 11px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  /* Legenda sotto il calendario */
  .rdp-legend {
    display: flex;
    gap: 20px;
    margin-top: 12px;
    font-size: 11px;
    color: #8a7f72;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 1px;
  }
  .rdp-legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .rdp-legend-dot {
    width: 14px;
    height: 14px;
    border-radius: 0;
    flex-shrink: 0;
  }
`;

// ─── APARTMENT CARD ──────────────────────────────────────────────────────────

function ApartmentCard({ apt, name, sqm, index, onSelect, ctaText }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/appartamenti/${APT_IDS[index]}`);
  };

  return (
    <div
      style={{ ...styles.aptCard, borderColor: hovered ? "#1a1a1a" : "#c8bfb1" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <img src={PHOTOS[APT_IDS[index]]} alt={name} style={styles.aptImage} loading="lazy" />
      <div style={styles.aptCardBody}>
        <div style={styles.aptNumber}>0{index + 1}</div>
        <div style={styles.aptName}>{name}</div>
        <div style={styles.aptTagline}>{apt.tagline}</div>
        <div style={styles.aptMeta}>
          <span>{apt.beds}</span>
          <span style={styles.aptSqm}>{sqm} m²</span>
        </div>
        <div style={styles.aptFeatures}>
          {apt.features.map((f, i) => <span key={i} style={styles.aptFeature}>{f}</span>)}
        </div>
        <div style={{ ...styles.aptCta, opacity: hovered ? 1 : 0, transform: hovered ? "translateY(0)" : "translateY(8px)" }}>
          {ctaText}
        </div>
      </div>
    </div>
  );
}

// ─── SOLAR COUNTER ───────────────────────────────────────────────────────────

function SolarCounter({ lang }) {
  const [data, setData] = useState(null);
  const [dot, setDot] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      fetch("/.netlify/functions/get-solar-sim")
        .then((r) => r.json())
        .then((d) => setData(d))
        .catch(() => {
          // Fallback: dati simulati basati sull'ora locale
          const hour = new Date().getHours();
          const isDay = hour >= 7 && hour <= 20;
          const peakHour = hour >= 11 && hour <= 15;
          const powerKw = isDay ? (peakHour ? 10.5 + Math.random() * 3 : 4 + Math.random() * 5) : 0;
          setData({
            available: true,
            powerKw: Math.round(powerKw * 10) / 10,
            dayEnergyKwh: Math.round(powerKw * (hour - 7) * 0.6 * 10) / 10,
            peakKw: 15,
            cloudCover: 20,
            isDay,
            temperature: 18,
            weatherIcon: isDay ? "☀️" : "🌙",
            weatherIt: isDay ? "Sereno" : "Notte",
            weatherEn: isDay ? "Clear sky" : "Night",
            sunset: "19:45",
          });
        });
    };
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Blink dot ogni secondo — segnale "live"
  useEffect(() => {
    const t = setInterval(() => setDot((d) => !d), 1000);
    return () => clearInterval(t);
  }, []);

  if (!data?.available) return null;

  const isIt = lang === "it";
  const weatherLabel = isIt ? data.weatherIt : data.weatherEn;
  const liveLabel = isIt ? "PRODUZIONE IN QUESTO MOMENTO" : "CURRENT SOLAR OUTPUT";
  const peakLabel = isIt ? "picco installato" : "installed peak";
  const cloudLabel = isIt ? "copertura nuvolosa" : "cloud cover";
  const nightLabel = isIt ? "Impianto a riposo — buona notte ☽" : "System resting — good night ☽";

  // Percentuale di utilizzo rispetto al picco
  const pct = Math.min(100, Math.round((data.powerKw / data.peakKw) * 100));

  return (
    <div style={solarStyles.wrapper}>

      {/* Header meteo */}
      <div style={solarStyles.weatherRow}>
        <span style={solarStyles.weatherIcon}>{data.weatherIcon}</span>
        <div>
          <div style={solarStyles.weatherLabel}>{weatherLabel}</div>
          <div style={solarStyles.weatherSub}>{data.temperature}°C · {data.cloudCover}% {cloudLabel}</div>
        </div>
        <div style={solarStyles.liveRow}>
          <span style={{ ...solarStyles.dot, opacity: dot ? 1 : 0.2 }}>●</span>
          <span style={solarStyles.liveLabel}>{liveLabel}</span>
        </div>
      </div>

      {data.isDay ? (
        <>
          {/* Potenza istantanea */}
          <div style={solarStyles.powerRow}>
            <span style={solarStyles.powerValue}>{data.powerKw.toFixed(1)}</span>
            <span style={solarStyles.powerUnit}>kW</span>
          </div>

          {/* Barra progresso */}
          <div style={solarStyles.barTrack}>
            <div style={{ ...solarStyles.barFill, width: `${pct}%` }} />
          </div>
          <div style={solarStyles.barLabels}>
            <span style={solarStyles.barLabelLeft}>0</span>
            <span style={solarStyles.barLabelRight}>{data.peakKw} kW {peakLabel}</span>
          </div>

          {/* Stats secondarie */}
          <div style={solarStyles.statsRow}>
            <div style={solarStyles.stat}>
              <span style={solarStyles.statValue}>{data.cloudCover}%</span>
              <span style={solarStyles.statLabel}>{cloudLabel}</span>
            </div>
            {data.sunshineSec != null && (
              <>
                <div style={solarStyles.statDivider} />
                <div style={solarStyles.stat}>
                  <span style={solarStyles.statValue}>{Math.round(data.sunshineSec / 3600 * 10) / 10}h</span>
                  <span style={solarStyles.statLabel}>{isIt ? "sole oggi" : "sunshine today"}</span>
                </div>
              </>
            )}
            {data.sunset && (
              <>
                <div style={solarStyles.statDivider} />
                <div style={solarStyles.stat}>
                  <span style={solarStyles.statValue}>{data.sunset.slice(11, 16)}</span>
                  <span style={solarStyles.statLabel}>{isIt ? "tramonto" : "sunset"}</span>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <div style={solarStyles.nightMsg}>{nightLabel}</div>
      )}
    </div>
  );
}

const solarStyles = {
  wrapper: { marginTop: 40, borderTop: "1px solid #3a4f38", paddingTop: 32 },
  weatherRow: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" },
  weatherIcon: { fontSize: 40, lineHeight: 1 },
  weatherLabel: { fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#e8efe4", fontWeight: 300 },
  weatherSub: { fontSize: 12, color: "#7a9a6e", fontFamily: "'DM Sans', sans-serif", marginTop: 2 },
  liveRow: { display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" },
  dot: { color: "#7a9a6e", fontSize: 10, transition: "opacity 0.4s ease" },
  liveLabel: { fontSize: 10, letterSpacing: 3, color: "#7a9a6e", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" },
  powerRow: { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 },
  powerValue: { fontFamily: "'Cormorant Garamond', serif", fontSize: 80, fontWeight: 300, color: "#e8efe4", lineHeight: 1 },
  powerUnit: { fontFamily: "'DM Sans', sans-serif", fontSize: 22, color: "#7a9a6e", letterSpacing: 2 },
  barTrack: { height: 4, background: "#3a4f38", borderRadius: 2, marginBottom: 6, overflow: "hidden" },
  barFill: { height: "100%", background: "#7a9a6e", borderRadius: 2, transition: "width 1s ease" },
  barLabels: { display: "flex", justifyContent: "space-between", marginBottom: 24 },
  barLabelLeft: { fontSize: 11, color: "#5a7a5a", fontFamily: "'DM Sans', sans-serif" },
  barLabelRight: { fontSize: 11, color: "#5a7a5a", fontFamily: "'DM Sans', sans-serif" },
  statsRow: { display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" },
  stat: { display: "flex", flexDirection: "column", gap: 4 },
  statValue: { fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#c8d8c4" },
  statLabel: { fontSize: 11, color: "#7a9a6e", letterSpacing: 1, fontFamily: "'DM Sans', sans-serif" },
  statDivider: { width: 1, height: 32, background: "#3a4f38", flexShrink: 0 },
  nightMsg: { fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "#7a9a6e", fontStyle: "italic", marginTop: 8 },
};

// ─── HOME PAGE ───────────────────────────────────────────────────────────────

export default function Home({ lang, setLang, scrollY }) {
  const [selectedApt, setSelectedApt] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = T[lang] || T.en;

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // nav index → section id or action
  const handleNav = (index) => {
    setMenuOpen(false);
    const map = {
      0: () => scrollTo("apartments"),
      1: () => scrollTo("pool"),
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
              style={styles.navLogo}
            />
          </a>

          {/* Desktop links */}
          <div style={{ display: "flex", alignItems: "center", gap: 32, "@media(max-width:768px)": { display: "none" } }}
               className="nav-desktop">
            {t.nav.map((item, i) => (
              <span key={item} style={styles.navLink} onClick={() => handleNav(i)}>{item}</span>
            ))}
            <div style={styles.langSwitch}>
              {["IT", "EN"].map((l) => (
                <span key={l} onClick={() => setLang(l.toLowerCase())}
                  style={{ ...styles.langBtn, ...(lang === l.toLowerCase() ? styles.langActive : {}) }}>
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Mobile: lang + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="nav-mobile">
            <div style={styles.langSwitch}>
              {["IT", "EN"].map((l) => (
                <span key={l} onClick={() => setLang(l.toLowerCase())}
                  style={{ ...styles.langBtn, ...(lang === l.toLowerCase() ? styles.langActive : {}) }}>
                  {l}
                </span>
              ))}
            </div>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              style={styles.hamburger}
              aria-label="Menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
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
        <div style={styles.heroContent}>
          <div style={styles.heroSub}>{t.heroSub}</div>
          <h1 style={styles.heroTitle}>La Ripa</h1>
          <p style={styles.heroTagline}>
            {t.heroTagline1}<br /><em style={{ fontStyle: "italic" }}>{t.heroTagline2}</em>
          </p>
          <div style={styles.heroDetails}>{t.heroDetails}</div>
          <button style={styles.heroCta} onClick={() => scrollTo("booking")}>{t.heroCta}</button>
        </div>
        <div style={styles.heroOverlay} />
      </section>

      {/* PROPERTY PHOTO */}
      <section style={styles.propertyPhoto}>
        <img src={PHOTOS.hero} alt="La Ripa di San Gimignano" style={styles.propertyImg} />
      </section>

      {/* ESSENCE */}
      <section style={styles.essenceSection}>
        <div style={styles.essenceGrid}>
          {[250, 4, 1, 0].map((n, i) => (
            <div key={i}>
              <div style={styles.essenceNumber}>{n}</div>
              <div style={styles.essenceLabel}>{t.essLabels[i]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* APARTMENTS */}
      <section id="apartments" style={styles.section}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionLabel}>{t.aptSection}</div>
          <h2 style={styles.sectionTitle}>{t.aptTitle}</h2>
          <div style={styles.aptGrid}>
            {t.apartments.map((apt, i) => (
              <ApartmentCard
                key={APT_IDS[i]}
                apt={apt}
                name={APT_NAMES[i]}
                sqm={APT_SQMS[i]}
                index={i}
                onSelect={(id) => { setSelectedApt(id); scrollTo("booking"); }}
                ctaText={t.aptCta}
              />
            ))}
          </div>
        </div>
      </section>

      {/* POOL */}
      <section id="pool" style={{ ...styles.section, padding: "0 0 100px", overflow: "hidden" }}>
        <div style={styles.poolHero}>
          {/* Placeholder until Duccio provides pool photo */}
          <div style={styles.poolPlaceholder}>
            <div style={{ textAlign: "center", color: "#8a7f72" }}>
              <div style={{ fontSize: 11, letterSpacing: 4, marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>FOTO IN ARRIVO</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300 }}>La Piscina</div>
            </div>
          </div>
        </div>
        <div style={styles.sectionInner}>
          <div style={{ paddingTop: 60 }}>
            <div style={styles.sectionLabel}>{t.poolLabel}</div>
            <h2 style={styles.sectionTitle}>{t.poolTitle}</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6b6156", fontSize: 16, maxWidth: 540, lineHeight: 1.8 }}>
              {t.poolDesc}
            </p>
          </div>
        </div>
      </section>

      {/* GREEN */}
      <section style={{ ...styles.section, background: "#2c3a2a", padding: "80px 24px" }}>
        <div style={styles.sectionInner}>
          <div style={{ ...styles.sectionLabel, color: "#7a9a6e" }}>{t.greenLabel}</div>
          <h2 style={{ ...styles.sectionTitle, color: "#e8efe4", marginBottom: 32 }}>
            {t.greenTitle1}<br />{t.greenTitle2}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
            {["15 kW", "21 kWh", "2"].map((val, i) => (
              <div key={i} style={{ borderLeft: "2px solid #7a9a6e", paddingLeft: 20 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: "#e8efe4", marginBottom: 4 }}>{val}</div>
                <div style={{ fontSize: 13, color: "#9ab38e", letterSpacing: 1 }}>{t.greenItems[i]}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#8aaa7e", fontSize: 14, maxWidth: 500, lineHeight: 1.7, marginTop: 32 }}>
            {t.greenNote}
          </p>
          <SolarCounter lang={lang} />
        </div>
      </section>

      {/* POSITION */}
      <section id="position" style={{ ...styles.section, background: "#1a1a1a" }}>
        <div style={styles.sectionInner}>
          <div style={{ ...styles.sectionLabel, color: "#8a7f72" }}>{t.posLabel}</div>
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

        {/* MAP */}
        <div style={styles.mapWrapper}>
          <iframe
            title="La Ripa — San Gimignano"
            src="https://www.openstreetmap.org/export/embed.html?bbox=11.031%2C43.472%2C11.112%2C43.532&layer=mapnik&marker=43.5023%2C11.0717"
            style={styles.mapIframe}
            loading="lazy"
          />
          <a
            href="https://www.openstreetmap.org/?mlat=43.5023&mlon=11.0717#map=14/43.5023/11.0717"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.mapCredit}
          >
            OpenStreetMap →
          </a>
        </div>

      </section>

      {/* REVIEWS */}
      <section style={{ padding: "100px 24px", background: "#f4efe8", borderTop: "1px solid #e0d8cc" }}>
        <div style={styles.sectionInner}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#8a7f72", marginBottom: 16, textTransform: "uppercase" }}>
            {lang === "it" ? "COSA DICONO I NOSTRI OSPITI" : "WHAT OUR GUESTS SAY"}
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 300, lineHeight: 1.2, marginBottom: 48 }}>
            {lang === "it" ? "Parole loro, non nostre." : "Their words, not ours."}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginBottom: 48 }}>
            {[
              {
                name: "A family from the Netherlands",
                stars: 5,
                text: "Very spacious holiday home in Tuscan style. Large pool, beautiful view of San Gimignano. Well located for trips in Tuscany. Very quiet, surrounded by vineyards.",
                source: "Booking.com",
              },
              {
                name: "Mathieu, France",
                stars: 5,
                text: "We are a family of 4 who spent a wonderful week at La Ripa. From the owner reception to the apartment, view, terrace and the pool — everything was perfect from start to finish. 360 degrees view on the country and San Gimignano.",
                source: "Tripadvisor",
              },
              {
                name: "A guest from Germany",
                stars: 5,
                text: "La Ripa ist ein herrliches Anwesen, bezaubernde Landschaft mit Wein und Oliven. Wir trafen sehr nette und hilfsbereite Menschen. Wer die Entspannung sucht, der findet sie hier.",
                source: "Google",
              },
              {
                name: "A family from USA",
                stars: 5,
                text: "Our family stayed in Nidi apartment — very clean and spacious. During our stay Duccio was taking care of guests. He was very friendly, helpful and responsive. We had a great time and would definitely come back.",
                source: "Tripadvisor",
              },
            ].map((r, i) => (
              <div key={i} style={{ border: "1px solid #e0d8cc", padding: "32px", background: "#fff", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {Array.from({ length: r.stars }).map((_, s) => (
                    <span key={s} style={{ color: "#d4a017", fontSize: 16, lineHeight: 1 }}>★</span>
                  ))}
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 300, lineHeight: 1.7, color: "#2a2218", fontStyle: "italic", flexGrow: 1 }}>
                  "{r.text}"
                </p>
                <div style={{ borderTop: "1px solid #e0d8cc", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "#4a4039", fontWeight: 500 }}>{r.name}</span>
                  <span style={{ fontSize: 10, letterSpacing: 1.5, color: "#8a7f72", fontFamily: "'DM Sans', sans-serif" }}>{r.source}</span>
                </div>
              </div>
            ))}
          </div>
          <a
            href="https://maps.app.goo.gl/LCYoa91ZD11mNQXz5"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 13, letterSpacing: 2, color: "#1a1a1a", borderBottom: "1px solid #1a1a1a", paddingBottom: 2, textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}
          >
            {lang === "it" ? "Leggi tutte le recensioni →" : "Read all reviews →"}
          </a>
        </div>
      </section>

      {/* NO TUSCANY NETWORK */}
      <section style={{ padding: "80px 24px", borderTop: "1px solid #c8bfb1", borderBottom: "1px solid #c8bfb1" }}>
        <div style={{ ...styles.sectionInner, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 4, color: "#8a7f72", marginBottom: 16 }}>NETWORK</div>
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
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 4, color: "#8a7f72" }}>{t.netGuests}</div>
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
          <BookingWidget t={t} preselected={selectedApt} />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div>
            <div style={styles.footerLogo}>LA RIPA</div>
            <div style={styles.footerSub}>San Gimignano · {t.footerPlace}</div>
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
            <div style={{ marginBottom: 12 }}>© {new Date().getFullYear()} La Ripa di San Gimignano</div>
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
              CIN Fienile: IT000000000000000000 · CIN Ghiri: IT000000000000000000<br />
              CIN Nidi: IT000000000000000000 · CIN Padronale: IT000000000000000000
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
  langBtn: { padding: "4px 10px", fontSize: 11, letterSpacing: 1, cursor: "pointer", transition: "all 0.2s", color: "#8a7f72" },
  langActive: { background: "#1a1a1a", color: "#f4efe8" },

  hero: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", background: "linear-gradient(135deg, #2c2418 0%, #1a1a1a 50%, #2c2418 100%)", padding: "0 24px", textAlign: "center" },
  heroOverlay: { position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 50%, rgba(200,180,150,0.08) 0%, transparent 70%)", pointerEvents: "none" },
  heroContent: { position: "relative", zIndex: 2, animation: "fadeUp 1s ease both" },
  heroSub: { fontSize: 12, letterSpacing: 4, color: "#8a7f72", marginBottom: 24, textTransform: "uppercase" },
  heroTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(48px, 10vw, 120px)", fontWeight: 300, color: "#f4efe8", letterSpacing: -1, lineHeight: 0.95, marginBottom: 24 },
  heroTagline: { fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 300, color: "#a89e91", lineHeight: 1.4, marginBottom: 32 },
  heroDetails: { fontSize: 13, color: "#6b6156", letterSpacing: 1, marginBottom: 40 },
  heroCta: { background: "transparent", color: "#f4efe8", border: "1px solid #f4efe8", padding: "14px 36px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, letterSpacing: 2, cursor: "pointer", transition: "all 0.3s ease" },

  propertyPhoto: { width: "100%", overflow: "hidden", lineHeight: 0 },
  propertyImg: { width: "100%", height: "auto", display: "block", maxHeight: 500, objectFit: "cover" },

  essenceSection: { padding: "80px 24px", borderBottom: "1px solid #c8bfb1" },
  essenceGrid: { maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 40, textAlign: "center" },
  essenceNumber: { fontFamily: "'Cormorant Garamond', serif", fontSize: 56, fontWeight: 300, lineHeight: 1, marginBottom: 8 },
  essenceLabel: { fontSize: 13, color: "#6b6156", letterSpacing: 1 },

  section: { padding: "100px 24px" },
  sectionInner: { maxWidth: 1000, margin: "0 auto" },
  sectionLabel: { fontSize: 11, letterSpacing: 4, color: "#8a7f72", marginBottom: 16, textTransform: "uppercase" },
  sectionTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 300, lineHeight: 1.2, marginBottom: 48 },

  poolHero: { width: "100%", height: 480, overflow: "hidden", position: "relative" },
  poolPlaceholder: { width: "100%", height: "100%", background: "#e8e0d4", display: "flex", alignItems: "center", justifyContent: "center" },

  aptGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 },
  aptCard: { border: "1px solid #c8bfb1", cursor: "pointer", transition: "all 0.3s ease", overflow: "hidden" },
  aptImage: { width: "100%", height: 200, objectFit: "cover", display: "block" },
  aptCardBody: { padding: 32 },
  aptNumber: { fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: "#8a7f72", marginBottom: 16 },
  aptName: { fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, marginBottom: 8 },
  aptTagline: { fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 300, fontStyle: "italic", color: "#6b6156", marginBottom: 20, lineHeight: 1.5 },
  aptMeta: { fontSize: 13, color: "#6b6156", display: "flex", justifyContent: "space-between", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #e0d8cc" },
  aptSqm: { fontWeight: 500 },
  aptFeatures: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  aptFeature: { fontSize: 11, letterSpacing: 1, padding: "4px 10px", border: "1px solid #d4ccc0", color: "#6b6156" },
  aptCta: { fontSize: 13, letterSpacing: 1, transition: "all 0.3s ease" },

  mapWrapper: { position: "relative", marginTop: 60, height: 420 },
  mapIframe: { width: "100%", height: "100%", border: "none", display: "block", filter: "grayscale(30%) contrast(1.05) brightness(0.9)" },
  mapCredit: { position: "absolute", bottom: 8, right: 8, fontSize: 10, color: "#a89e91", textDecoration: "none", letterSpacing: 1, fontFamily: "'DM Sans', sans-serif", background: "rgba(26,26,26,0.7)", padding: "3px 8px" },

  citiesGrid: { display: "flex", flexDirection: "column" },
  cityRow: { display: "grid", gridTemplateColumns: "120px 1fr 60px 1fr", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: "1px solid #2a2a2a" },
  cityName: { fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: "#f4efe8" },
  cityDots: { borderBottom: "1px dotted #444", height: 1 },
  cityKm: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#8a7f72", textAlign: "right" },
  cityHighlight: { fontSize: 13, color: "#6b6156", fontStyle: "italic" },

  altAptsWrapper: { marginTop: 32 },
  altAptsLabel: { fontSize: 11, letterSpacing: 3, color: "#8a7f72", marginBottom: 16, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" },
  altAptsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  altAptCard: { background: "none", border: "1px solid #e0d8cc", padding: 0, cursor: "pointer", textAlign: "left", overflow: "hidden", transition: "border-color 0.2s" },
  altAptCardActive: { borderColor: "#1a1a1a" },
  altAptImg: { width: "100%", height: 100, objectFit: "cover", display: "block" },
  altAptName: { fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 400, padding: "10px 12px 2px", color: "#1a1a1a" },
  altAptSub: { fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#8a7f72", padding: "0 12px 10px", letterSpacing: 0.5 },

  bookingWidget: { border: "1px solid #1a1a1a", padding: 40, maxWidth: 720 },
  bookingTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, marginBottom: 32 },
  bookingFields: { display: "flex", flexDirection: "column", gap: 20 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: 11, letterSpacing: 2, color: "#8a7f72", textTransform: "uppercase" },
  fieldInput: { border: "none", borderBottom: "1px solid #c8bfb1", background: "transparent", padding: "10px 0", fontSize: 16, outline: "none", fontFamily: "'DM Sans', sans-serif", color: "#1a1a1a" },
  calendarWrapper: { borderTop: "1px solid #e0d8cc", borderBottom: "1px solid #e0d8cc", padding: "20px 0", position: "relative" },
  calendarLoading: { fontSize: 12, color: "#8a7f72", letterSpacing: 1, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" },
  calendarLegend: { display: "flex", gap: 20, marginTop: 12, marginBottom: 4, flexWrap: "wrap" },
  legendItem: { display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "#8a7f72", fontFamily: "'DM Sans', sans-serif", letterSpacing: 1 },
  legendDot: { width: 14, height: 14, flexShrink: 0 },
  rangeLabel: { fontSize: 13, color: "#4a4039", fontFamily: "'DM Sans', sans-serif", marginTop: 12, paddingTop: 12, borderTop: "1px solid #e0d8cc" },
  priceBreakdown: { marginTop: 12, padding: "14px 16px", background: "#f9f6f1", border: "1px solid #e0d8cc", display: "flex", flexDirection: "column", gap: 8 },
  priceRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#4a4039", fontFamily: "'DM Sans', sans-serif", gap: 12 },
  bookBtn: { marginTop: 12, background: "#1a1a1a", color: "#f4efe8", border: "1px solid #1a1a1a", padding: "14px 36px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, letterSpacing: 2, cursor: "pointer", transition: "all 0.3s ease", alignSelf: "flex-start" },

  footer: { borderTop: "1px solid #c8bfb1", padding: "60px 24px" },
  footerInner: { maxWidth: 1000, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 32 },
  footerLogo: { fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, letterSpacing: 4, marginBottom: 4 },
  footerSub: { fontSize: 12, color: "#8a7f72" },
  footerContact: { fontSize: 13, color: "#6b6156", lineHeight: 1.8 },
  whatsappBtn: { display: "inline-flex", alignItems: "center", gap: 8, marginTop: 12, padding: "10px 20px", background: "#25D366", color: "#fff", textDecoration: "none", fontSize: 13, letterSpacing: 1, fontFamily: "'DM Sans', sans-serif" },
  footerBottom: { width: "100%", fontSize: 11, color: "#8a7f72", marginTop: 24, paddingTop: 24, borderTop: "1px solid #e0d8cc" },
};

import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { APARTMENTS } from "../data/apartments";
import { ApartmentSEO } from "../components/SEO";

function AptSlideshow({ images }) {
  const [idx, setIdx] = useState(0);
  const [preloaded, setPreloaded] = useState(new Set([0, 1]));

  const go = (n) => {
    const next = (n + images.length) % images.length;
    setPreloaded((s) => new Set([...s, next, (next + 1) % images.length]));
    setIdx(next);
  };

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
              transition: "opacity 0.6s ease",
            }}
          />
        ) : null
      )}
      <button onClick={() => go(idx - 1)} style={arrow("left")}>‹</button>
      <button onClick={() => go(idx + 1)} style={arrow("right")}>›</button>
      <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "'DM Sans', sans-serif", letterSpacing: 2 }}>
        {idx + 1} / {images.length}
      </div>
    </div>
  );
}

const arrow = (side) => ({
  position: "absolute", top: "50%", transform: "translateY(-50%)",
  [side]: 16, background: "rgba(0,0,0,0.4)", color: "#fff",
  border: "none", cursor: "pointer", fontSize: 32, lineHeight: 1,
  padding: "10px 16px", zIndex: 2, transition: "background 0.2s",
});

export default function Apartment({ lang = "en" }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const aptIndex = APARTMENTS.findIndex((a) => a.id === id);
  const apt = APARTMENTS[aptIndex];

  if (!apt) {
    return (
      <div style={{ padding: "120px 24px", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <p style={{ color: "#8a7f72" }}>Appartamento non trovato.</p>
        <Link to="/" style={{ color: "#1a1a1a", fontSize: 13 }}>← Homepage</Link>
      </div>
    );
  }

  const t = apt[lang] || apt.en;
  const prevApt = aptIndex > 0 ? APARTMENTS[aptIndex - 1] : null;
  const nextApt = aptIndex < APARTMENTS.length - 1 ? APARTMENTS[aptIndex + 1] : null;

  const bookLabel = lang === "it" ? "Prenota questo appartamento →" : "Book this apartment →";
  const backLabel = lang === "it" ? "← Tutti gli appartamenti" : "← All apartments";
  const amenitiesLabel = lang === "it" ? "DOTAZIONI" : "AMENITIES";
  const specsLabel = lang === "it" ? "DETTAGLI" : "DETAILS";
  const bedsLabel = lang === "it" ? "Letti" : "Beds";
  const bathsLabel = lang === "it" ? "Bagni" : "Bathrooms";
  const floorLabel = lang === "it" ? "Piano" : "Floor";
  const viewLabel = lang === "it" ? "Vista" : "View";
  const sqmLabel = "m²";

  return (
    <div style={styles.page}>
      <ApartmentSEO apt={apt} lang={lang} />

      {/* Back link */}
      <div style={styles.backBar}>
        <Link to="/#apartments" style={styles.backLink}>{backLabel}</Link>
      </div>

      {/* Slideshow */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
        <AptSlideshow images={apt.gallery.length > 1 ? apt.gallery : [apt.photo]} />
      </div>

      {/* Content */}
      <div style={styles.content}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.aptLabel}>
            {String(aptIndex + 1).padStart(2, "0")} / {APARTMENTS.length}
          </div>
          <h1 style={styles.aptName}>{apt.name}</h1>
          <p style={styles.aptTagline}>{t.tagline}</p>
        </div>

        <div style={styles.body}>

          {/* Description */}
          <p style={styles.description}>{t.description}</p>

          {/* Specs */}
          <div style={styles.specsBlock}>
            <div style={styles.blockLabel}>{specsLabel}</div>
            <div style={styles.specsGrid}>
              <div style={styles.specItem}>
                <div style={styles.specValue}>{apt.sqm} {sqmLabel}</div>
                <div style={styles.specKey}>Superficie</div>
              </div>
              <div style={styles.specItem}>
                <div style={styles.specValue}>{apt.maxGuests}</div>
                <div style={styles.specKey}>{lang === "it" ? "Ospiti max" : "Max guests"}</div>
              </div>
              <div style={styles.specItem}>
                <div style={styles.specValue}>{t.bathrooms}</div>
                <div style={styles.specKey}>{bathsLabel}</div>
              </div>
              <div style={styles.specItem}>
                <div style={styles.specValue}>{t.floor}</div>
                <div style={styles.specKey}>{floorLabel}</div>
              </div>
            </div>
            <div style={styles.bedsRow}>
              <span style={styles.specKey}>{bedsLabel}:</span>{" "}
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#4a4039" }}>{t.beds_detail}</span>
            </div>
            <div style={styles.viewRow}>
              <span style={styles.specKey}>{viewLabel}:</span>{" "}
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#4a4039" }}>{t.view}</span>
            </div>
          </div>

          {/* Amenities */}
          <div style={styles.amenitiesBlock}>
            <div style={styles.blockLabel}>{amenitiesLabel}</div>
            <div style={styles.amenitiesList}>
              {apt.amenities.map((item, i) => (
                <div key={i} style={styles.amenityTag}>
                  <span style={styles.amenityIcon}>{item.icon}</span>
                  <span>{item[lang] || item.it}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            style={styles.bookBtn}
            onClick={() => {
              navigate(`/?apt=${apt.id}`);
              setTimeout(() => {
                document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
              }, 150);
            }}
          >
            {bookLabel}
          </button>

        </div>
      </div>

      {/* Navigation between apartments */}
      <div style={styles.aptNav}>
        {prevApt ? (
          <Link to={`/appartamenti/${prevApt.id}`} style={styles.aptNavLink}>
            ← {prevApt.name}
          </Link>
        ) : <span />}
        {nextApt ? (
          <Link to={`/appartamenti/${nextApt.id}`} style={{ ...styles.aptNavLink, textAlign: "right" }}>
            {nextApt.name} →
          </Link>
        ) : <span />}
      </div>

    </div>
  );
}

const styles = {
  page: {
    background: "#f4efe8",
    minHeight: "100vh",
    fontFamily: "'DM Sans', sans-serif",
    color: "#1a1a1a",
  },
  backBar: {
    padding: "88px 40px 24px",
    maxWidth: 1000,
    margin: "0 auto",
  },
  backLink: {
    fontSize: 12,
    letterSpacing: 2,
    color: "#8a7f72",
    textDecoration: "none",
    fontFamily: "'DM Sans', sans-serif",
    textTransform: "uppercase",
  },
  content: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "60px 40px 80px",
  },
  header: {
    marginBottom: 48,
    borderBottom: "1px solid #c8bfb1",
    paddingBottom: 40,
  },
  aptLabel: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 14,
    color: "#8a7f72",
    marginBottom: 12,
  },
  aptName: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(40px, 6vw, 72px)",
    fontWeight: 300,
    lineHeight: 0.95,
    marginBottom: 16,
  },
  aptTagline: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 20,
    fontWeight: 300,
    fontStyle: "italic",
    color: "#6b6156",
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 48,
  },
  description: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 16,
    lineHeight: 1.8,
    color: "#4a4039",
    maxWidth: 640,
  },
  blockLabel: {
    fontSize: 11,
    letterSpacing: 4,
    color: "#8a7f72",
    marginBottom: 20,
    textTransform: "uppercase",
    fontFamily: "'DM Sans', sans-serif",
  },
  specsBlock: {},
  specsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 24,
    marginBottom: 20,
  },
  specItem: {
    borderLeft: "2px solid #c8bfb1",
    paddingLeft: 16,
  },
  specValue: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 26,
    fontWeight: 300,
    marginBottom: 4,
  },
  specKey: {
    fontSize: 11,
    letterSpacing: 1,
    color: "#8a7f72",
    textTransform: "uppercase",
    fontFamily: "'DM Sans', sans-serif",
  },
  bedsRow: {
    fontSize: 13,
    color: "#6b6156",
    marginBottom: 8,
    fontFamily: "'DM Sans', sans-serif",
  },
  viewRow: {
    fontSize: 13,
    color: "#6b6156",
    fontFamily: "'DM Sans', sans-serif",
  },
  amenitiesBlock: {},
  amenitiesList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 10,
  },
  amenityTag: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    padding: "10px 14px",
    border: "1px solid #e0d8cc",
    color: "#4a4039",
    fontFamily: "'DM Sans', sans-serif",
    background: "#faf7f3",
  },
  amenityIcon: {
    fontSize: 18,
    lineHeight: 1,
    flexShrink: 0,
  },
  bookBtn: {
    background: "#1a1a1a",
    color: "#f4efe8",
    border: "1px solid #1a1a1a",
    padding: "16px 40px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    letterSpacing: 2,
    cursor: "pointer",
    alignSelf: "flex-start",
    transition: "all 0.3s ease",
  },
  aptNav: {
    borderTop: "1px solid #c8bfb1",
    padding: "32px 40px",
    maxWidth: 1000,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  aptNavLink: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 20,
    fontWeight: 300,
    color: "#1a1a1a",
    textDecoration: "none",
  },
};

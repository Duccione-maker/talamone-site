import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

const T = {
  it: {
    label: "PRENOTAZIONE CONFERMATA",
    title: "Ci vediamo a La Ripa.",
    subtitle: "Il tuo pagamento è andato a buon fine.",
    body: "Riceverai una email di conferma a breve. Nel frattempo, se hai domande siamo disponibili su WhatsApp.",
    whatsapp: "Scrivici su WhatsApp",
    home: "← Torna alla homepage",
    networkLabel: "NEL FRATTEMPO",
    networkTitle: "Scopri la tua Toscana.",
    networkDesc:
      "Mi Manda Duccio è la guida riservata agli ospiti La Ripa. Ristoranti, artigiani, esperienze — solo posti selezionati personalmente.",
    networkLink: "Vai su No Tuscany →",
  },
  en: {
    label: "BOOKING CONFIRMED",
    title: "See you at La Ripa.",
    subtitle: "Your payment was successful.",
    body: "You will receive a confirmation email shortly. In the meantime, feel free to reach us on WhatsApp.",
    whatsapp: "Message us on WhatsApp",
    home: "← Back to homepage",
    networkLabel: "IN THE MEANTIME",
    networkTitle: "Discover your Tuscany.",
    networkDesc:
      "Mi Manda Duccio is the guide reserved for La Ripa guests. Restaurants, artisans, experiences — only personally selected spots.",
    networkLink: "Visit No Tuscany →",
  },
};

export default function BookingSuccess({ lang = "en" }) {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const t = T[lang] || T.en;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Checkmark */}
        <div style={styles.checkmark}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="23" stroke="#7a9a6e" strokeWidth="1.5" />
            <path d="M14 24l8 8 12-16" stroke="#7a9a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div style={styles.label}>{t.label}</div>
        <h1 style={styles.title}>{t.title}</h1>
        <p style={styles.subtitle}>{t.subtitle}</p>
        <p style={styles.body}>{t.body}</p>

        {sessionId && (
          <div style={styles.sessionId}>
            Ref: <code style={{ fontFamily: "monospace", fontSize: 12 }}>{sessionId}</code>
          </div>
        )}

        <div style={styles.actions}>
          <a
            href="https://wa.me/393517352679"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.whatsappBtn}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {t.whatsapp}
          </a>

          <Link to="/" style={styles.homeLink}>
            {t.home}
          </Link>
        </div>

        {/* No Tuscany teaser */}
        <div style={styles.networkBox}>
          <div style={styles.networkLabel}>{t.networkLabel}</div>
          <div style={styles.networkTitle}>{t.networkTitle}</div>
          <p style={styles.networkDesc}>{t.networkDesc}</p>
          <a
            href="https://notuscany.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.networkLink}
          >
            {t.networkLink}
          </a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#f4efe8",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "120px 24px 80px",
  },
  container: {
    maxWidth: 560,
    width: "100%",
    textAlign: "center",
  },
  checkmark: {
    marginBottom: 32,
  },
  label: {
    fontSize: 11,
    letterSpacing: 4,
    color: "#8a7f72",
    marginBottom: 16,
    textTransform: "uppercase",
    fontFamily: "'DM Sans', sans-serif",
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(32px, 5vw, 52px)",
    fontWeight: 300,
    color: "#1a1a1a",
    marginBottom: 16,
    lineHeight: 1.1,
  },
  subtitle: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 16,
    color: "#4a4039",
    marginBottom: 12,
  },
  body: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: "#6b6156",
    lineHeight: 1.7,
    marginBottom: 24,
  },
  sessionId: {
    fontSize: 11,
    color: "#a89e91",
    marginBottom: 32,
    fontFamily: "'DM Sans', sans-serif",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    marginBottom: 48,
  },
  whatsappBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 28px",
    background: "#25D366",
    color: "#fff",
    textDecoration: "none",
    fontSize: 13,
    letterSpacing: 1,
    fontFamily: "'DM Sans', sans-serif",
  },
  homeLink: {
    fontSize: 13,
    color: "#8a7f72",
    textDecoration: "none",
    letterSpacing: 1,
    fontFamily: "'DM Sans', sans-serif",
  },
  networkBox: {
    background: "#1a1a1a",
    padding: 40,
    textAlign: "left",
  },
  networkLabel: {
    fontSize: 11,
    letterSpacing: 4,
    color: "#8a7f72",
    marginBottom: 12,
    fontFamily: "'DM Sans', sans-serif",
    textTransform: "uppercase",
  },
  networkTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 28,
    fontWeight: 300,
    color: "#f4efe8",
    marginBottom: 16,
  },
  networkDesc: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: "#a89e91",
    lineHeight: 1.8,
    marginBottom: 20,
  },
  networkLink: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    letterSpacing: 2,
    color: "#f4efe8",
    borderBottom: "1px solid #f4efe8",
    paddingBottom: 2,
    textDecoration: "none",
  },
};

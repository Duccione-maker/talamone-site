import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function Admin() {
  const [params] = useSearchParams();

  const inp = {
    width: "100%", padding: "10px 14px", border: "1px solid #d4ccc0",
    background: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
    color: "#1a1a1a", outline: "none", boxSizing: "border-box",
  };
  const lbl = {
    fontSize: 10, letterSpacing: 2, color: "#8a7f72",
    fontFamily: "'DM Sans', sans-serif", marginBottom: 6, display: "block",
  };

  const [secret, setSecret] = useState("");
  const [name, setName] = useState(params.get("name") || "");
  const [email, setEmail] = useState(params.get("email") || "");
  const [checkIn, setCheckIn] = useState(params.get("checkin") || "");
  const [checkOut, setCheckOut] = useState(params.get("checkout") || "");
  const [nights, setNights] = useState(params.get("nights") || "");
  const [guests, setGuests] = useState(params.get("guests") || "");
  const [total, setTotal] = useState(params.get("total")?.replace("€", "") || "");
  const lang = params.get("lang") || "it";

  const [status, setStatus] = useState(null);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerate = async () => {
    if (!secret || !total) return;
    setStatus("loading");
    setLink("");
    setErrorMsg("");

    const totalCents = Math.round(parseFloat(total.replace(",", ".")) * 100);

    try {
      const res = await fetch("/.netlify/functions/generate-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminSecret: secret,
          guestName: name,
          guestEmail: email,
          checkIn,
          checkOut,
          nights: parseInt(nights) || undefined,
          guests: parseInt(guests) || undefined,
          totalCents,
        }),
      });
      const data = await res.json();
      if (data.url) {
        setLink(data.url);
        setStatus("done");
      } else {
        setErrorMsg(data.error || "Errore sconosciuto");
        setStatus("error");
      }
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const draftEmail = (payLink) => {
    const firstName = name ? name.split(" ")[0] : null;
    const dates = checkIn && checkOut ? `\n• Check-in: ${checkIn}\n• Check-out: ${checkOut}` : "";

    const templates = {
      it: {
        greeting: `Gentile ${firstName || "ospite"},`,
        intro: "Grazie per la tua richiesta di soggiorno a Cala di Forno Talamone.\n\nSiamo lieti di confermarti la disponibilità. Di seguito i dettagli della prenotazione:",
        nights: `Notti`,
        guests: `Ospiti`,
        total: `Totale`,
        cta: "Per completare la prenotazione clicca sul link qui sotto:",
        disclaimer: "Il pagamento è gestito in modo sicuro da Stripe, leader mondiale nei pagamenti digitali. Non conserviamo nessun dato della tua carta. Il link è personale e valido per 23 ore.",
        question: "Per qualsiasi domanda scrivici a info@notuscany.com",
        bye: "A presto,",
        team: "Il team di No Tuscany",
      },
      en: {
        greeting: `Dear ${firstName || "guest"},`,
        intro: "Thank you for your booking request at Cala di Forno Talamone.\n\nWe are pleased to confirm availability for your stay. Here are the details:",
        nights: `Nights`,
        guests: `Guests`,
        total: `Total`,
        cta: "To complete your booking, click the secure payment link below:",
        disclaimer: "Payment is handled securely by Stripe, a world leader in digital payments. We do not store any of your card details. The link is personal and valid for 23 hours.",
        question: "For any questions, write to us at info@notuscany.com",
        bye: "See you soon,",
        team: "The No Tuscany team",
      },
      de: {
        greeting: `Liebe/r ${firstName || "Gast"},`,
        intro: "Vielen Dank für Ihre Buchungsanfrage für Cala di Forno Talamone.\n\nWir freuen uns, Ihnen die Verfügbarkeit zu bestätigen. Hier sind die Details:",
        nights: `Nächte`,
        guests: `Gäste`,
        total: `Gesamt`,
        cta: "Um Ihre Buchung abzuschließen, klicken Sie bitte auf den sicheren Zahlungslink:",
        disclaimer: "Die Zahlung wird sicher über Stripe abgewickelt, einem weltweit führenden Anbieter für digitale Zahlungen. Wir speichern keine Ihrer Kartendaten. Der Link ist persönlich und 23 Stunden gültig.",
        question: "Bei Fragen schreiben Sie uns an info@notuscany.com",
        bye: "Bis bald,",
        team: "Das No Tuscany Team",
      },
      fr: {
        greeting: `Cher/Chère ${firstName || "client(e)"},`,
        intro: "Merci pour votre demande de séjour à Cala di Forno Talamone.\n\nNous avons le plaisir de vous confirmer la disponibilité. Voici les détails de votre réservation :",
        nights: `Nuits`,
        guests: `Voyageurs`,
        total: `Total`,
        cta: "Pour finaliser votre réservation, cliquez sur le lien de paiement sécurisé :",
        disclaimer: "Le paiement est géré en toute sécurité par Stripe, leader mondial des paiements numériques. Nous ne conservons aucune donnée de votre carte. Le lien est personnel et valable 23 heures.",
        question: "Pour toute question, écrivez-nous à info@notuscany.com",
        bye: "À bientôt,",
        team: "L'équipe No Tuscany",
      },
      es: {
        greeting: `Estimado/a ${firstName || "huésped"},`,
        intro: "Gracias por su solicitud de estancia en Cala di Forno Talamone.\n\nNos complace confirmarle la disponibilidad. A continuación los detalles de su reserva:",
        nights: `Noches`,
        guests: `Huéspedes`,
        total: `Total`,
        cta: "Para completar su reserva, haga clic en el enlace de pago seguro:",
        disclaimer: "El pago es gestionado de forma segura por Stripe, líder mundial en pagos digitales. No almacenamos ningún dato de su tarjeta. El enlace es personal y válido durante 23 horas.",
        question: "Para cualquier consulta escríbanos a info@notuscany.com",
        bye: "Hasta pronto,",
        team: "El equipo de No Tuscany",
      },
    };

    const t = templates[lang] || templates.en;
    const nightsLine = nights ? `\n• ${t.nights}: ${nights}` : "";
    const guestsLine = guests ? `\n• ${t.guests}: ${guests}` : "";
    const totalLine = total ? `\n• ${t.total}: €${total}` : "";

    return `${t.greeting}

${t.intro}${dates}${nightsLine}${guestsLine}${totalLine}

${t.cta}
${payLink}

${t.disclaimer}

${t.question}

${t.bye}
${t.team}
Cala di Forno · Talamone · notuscany.com`;
  };

  const handleEmailCopy = () => {
    navigator.clipboard.writeText(draftEmail(link));
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4efe8", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 520, background: "#fff", padding: 40, border: "1px solid #e0d8cc" }}>

        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 300, marginBottom: 4 }}>
          Genera link pagamento
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#8a7f72", letterSpacing: 2, marginBottom: 36 }}>
          CALA DI FORNO · ADMIN
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div>
            <label style={lbl}>CODICE ADMIN</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              style={inp}
              placeholder="••••••••"
            />
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e0d8cc", margin: "4px 0" }} />

          <div>
            <label style={lbl}>NOME OSPITE</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={inp} placeholder="Mario Rossi" />
          </div>

          <div>
            <label style={lbl}>EMAIL OSPITE</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inp} placeholder="mario@email.com" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>CHECK-IN</label>
              <input value={checkIn} onChange={(e) => setCheckIn(e.target.value)} style={inp} placeholder="2026-08-01" />
            </div>
            <div>
              <label style={lbl}>CHECK-OUT</label>
              <input value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={inp} placeholder="2026-08-08" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>NOTTI</label>
              <input type="number" value={nights} onChange={(e) => setNights(e.target.value)} style={inp} placeholder="7" />
            </div>
            <div>
              <label style={lbl}>OSPITI</label>
              <input type="number" value={guests} onChange={(e) => setGuests(e.target.value)} style={inp} placeholder="2" />
            </div>
          </div>

          <div>
            <label style={lbl}>TOTALE DA PAGARE (€)</label>
            <input
              type="text"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              style={{ ...inp, fontSize: 18, fontWeight: 600 }}
              placeholder="850.00"
            />
            <div style={{ fontSize: 11, color: "#8a7f72", marginTop: 5, fontFamily: "'DM Sans', sans-serif" }}>
              Puoi modificare il totale prima di generare il link.
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!secret || !total || status === "loading"}
            style={{
              background: "#1a1a1a", color: "#f4efe8", border: "none",
              padding: "15px 24px", fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, letterSpacing: 2, marginTop: 4,
              cursor: (!secret || !total || status === "loading") ? "not-allowed" : "pointer",
              opacity: (!secret || !total || status === "loading") ? 0.4 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {status === "loading" ? "GENERAZIONE IN CORSO..." : "GENERA LINK STRIPE →"}
          </button>

          {status === "done" && link && (
            <>
              <div style={{ background: "#f0faf0", border: "1px solid #b8d8b8", padding: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: 2, color: "#4a7a4a", marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>
                  ✓ LINK GENERATO — VALIDO 23 ORE
                </div>
                <div style={{ fontSize: 13, wordBreak: "break-all", color: "#2a2a2a", marginBottom: 14, fontFamily: "monospace", lineHeight: 1.5 }}>
                  {link}
                </div>
                <button
                  onClick={handleCopy}
                  style={{ background: "#4a7a4a", color: "#fff", border: "none", padding: "9px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: 1, cursor: "pointer" }}
                >
                  {copied ? "✓ COPIATO!" : "COPIA LINK"}
                </button>
              </div>

              <div style={{ border: "1px solid #e0d8cc", padding: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: 2, color: "#8a7f72", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>
                  BOZZA EMAIL DA INVIARE ALL'OSPITE
                </div>
                <textarea
                  readOnly
                  value={draftEmail(link)}
                  style={{ width: "100%", minHeight: 280, padding: 12, fontSize: 13, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, border: "1px solid #e0d8cc", background: "#faf7f3", color: "#1a1a1a", resize: "vertical", boxSizing: "border-box" }}
                />
                <button
                  onClick={handleEmailCopy}
                  style={{ marginTop: 10, background: "#1a1a1a", color: "#f4efe8", border: "none", padding: "9px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: 1, cursor: "pointer" }}
                >
                  {emailCopied ? "✓ TESTO COPIATO!" : "COPIA TESTO EMAIL"}
                </button>
              </div>
            </>
          )}

          {status === "error" && (
            <div style={{ color: "#a0522d", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
              Errore: {errorMsg}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

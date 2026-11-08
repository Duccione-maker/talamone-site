// Deposit + balance, shared by create-checkout (both sites) and charge-balances.
//
// Rule: if arrival is more than 7 days away, the guest pays a €250 deposit now
// (card saved with consent) and the balance is charged 7 days before arrival.
// Otherwise the guest pays everything now.
// Cancellation: full refund up to 24 hours before check-in; in the last 24
// hours one night is kept; after check-in nothing is refunded. Refunds are made
// from the "Annulla e rimborsa" link in the Telegram message (refund-booking.js).

const DEPOSIT_CENTS = 25000;
// TODO-VERIFICA: check-in time used by the cancellation rule (Italian time)
const CHECKIN_HOUR = 15;
const BALANCE_DAYS_BEFORE = 7;

// today's date in Italy, YYYY-MM-DD
function todayRome(now = new Date()) {
  return now.toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
}

function addDays(ymd, days) {
  const d = new Date(ymd + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// { plan: "deposit"|"full", payNowCents, balanceCents, balanceDueDate }
function paymentPlan(totalCents, checkIn, now) {
  const due = addDays(checkIn, -BALANCE_DAYS_BEFORE);
  if (todayRome(now) < due && totalCents > DEPOSIT_CENTS) {
    return { plan: "deposit", payNowCents: DEPOSIT_CENTS, balanceCents: totalCents - DEPOSIT_CENTS, balanceDueDate: due };
  }
  return { plan: "full", payNowCents: totalCents, balanceCents: 0, balanceDueDate: "" };
}

// the instant of YYYY-MM-DD at hour:00, Italian time
function romeInstant(ymd, hour) {
  const guess = new Date(`${ymd}T${String(hour).padStart(2, "0")}:00:00Z`);
  const rome = new Date(guess.toLocaleString("sv-SE", { timeZone: "Europe/Rome" }).replace(" ", "T") + "Z");
  return new Date(guess.getTime() - (rome.getTime() - guess.getTime()));
}

// How much of a booking is kept if cancelled now.
// { rule: "full"|"one-night"|"none", keepCents }
function cancellationKeep({ checkIn, nights, totalCents, cityTaxCents, cleaningCents }, now = new Date()) {
  const arrival = romeInstant(checkIn, CHECKIN_HOUR);
  if (now >= arrival) return { rule: "none", keepCents: totalCents };
  if (arrival - now < 24 * 3600 * 1000) {
    const accommodation = totalCents - (cityTaxCents || 0) - (cleaningCents || 0);
    return { rule: "one-night", keepCents: Math.min(totalCents, Math.round(accommodation / Math.max(1, nights))) };
  }
  return { rule: "full", keepCents: 0 };
}

const eur = (c) => "€" + (c / 100).toFixed(2).replace(".", ",");
const dmy = (ymd) => ymd.split("-").reverse().join("/");

// Text shown above the Pay button on Stripe Checkout (max 1200 chars)
function checkoutNote(p, lang) {
  const it = lang === "it";
  const cancel = it
    ? "Cancellazione gratuita fino a 24 ore prima dell'arrivo: ti rimborsiamo tutto. Nelle ultime 24 ore paghi una notte; dopo l'arrivo non sono previsti rimborsi."
    : "Free cancellation up to 24 hours before arrival: we refund everything. In the last 24 hours you pay one night; after arrival there are no refunds.";
  if (p.plan !== "deposit") return cancel;
  return (it
    ? `Oggi paghi ${eur(p.payNowCents)} di acconto. Il saldo di ${eur(p.balanceCents)} verrà addebitato su questa carta il ${dmy(p.balanceDueDate)}, 7 giorni prima dell'arrivo: confermando, ci autorizzi a farlo. `
    : `Today you pay a ${eur(p.payNowCents)} deposit. The balance of ${eur(p.balanceCents)} will be charged to this card on ${dmy(p.balanceDueDate)}, 7 days before arrival: by confirming, you authorise us to do so. `) + cancel;
}

// Extra fields for stripe.checkout.sessions.create
function checkoutParams(p, lang, metadata) {
  const meta = {
    ...metadata,
    paymentPlan: p.plan,
    payNowCents: String(p.payNowCents),
    balanceCents: String(p.balanceCents),
    balanceDueDate: p.balanceDueDate,
    balanceStatus: p.plan === "deposit" ? "pending" : "none",
    lang: lang === "it" ? "it" : "en",
  };
  const params = {
    locale: lang === "it" ? "it" : "en",
    metadata: meta,
    custom_text: { submit: { message: checkoutNote(p, lang) } },
    payment_intent_data: { metadata: meta },
  };
  if (p.plan === "deposit") {
    params.customer_creation = "always";
    params.payment_intent_data.setup_future_usage = "off_session";
  }
  return params;
}

module.exports = { DEPOSIT_CENTS, todayRome, addDays, paymentPlan, checkoutParams, cancellationKeep, romeInstant, eur, dmy };

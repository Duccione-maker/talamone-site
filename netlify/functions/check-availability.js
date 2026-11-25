// /.netlify/functions/check-availability
//
// Everything comes from Smoobu, nothing is written by hand here:
//   - iCal of the apartment: booked nights;
//   - /api/rates: price, minimum stay and availability of each night.
// The minimum stay is the one Smoobu sets for the arrival day.
// Price: ../shared/pricing.js (direct, weekly, early/last-minute discounts on
// the nights) + cleaning. City tax is shown apart and paid at the property.
//
// ENV VARS needed:
//   SMOOBU_ICAL_CALA         = https://login.smoobu.com/en/cockpit/ical/...
//   SMOOBU_API_KEY           = API key from Smoobu Settings
//   SMOOBU_API_SECRET        = API secret from Smoobu Settings (HMAC signing)
//   SMOOBU_APT_ID_CALA       = 3397626
//   CITY_TAX_CENTS           = Talamone city tax per person per night, in
//                              cents (optional, default 150: TO BE VERIFIED)

const { DOG_CENTS, MAX_DOGS, isDate, addDays, daysBetween, priceNights } = require("../shared/pricing");
const { smoobuFetch, SmoobuConfigError } = require("../shared/smoobu");

// Fixed charges of Cala di Forno, the only figures not read from Smoobu.
const RULES = {
  cleaningCents: 3900,          // cleaning, per stay
  // Talamone (Orbetello): per person aged 14+ per night. Amount to be verified,
  // set CITY_TAX_CENTS on Netlify to change it without touching the code.
  cityTaxCents: Number(process.env.CITY_TAX_CENTS) || 150,
  cityTaxMinAge: 14,
  cityTaxMaxNights: 5,
  cityTaxPaidOnSite: true,
  dogCents: DOG_CENTS,          // dogs are free of charge (0)
  maxDogs: MAX_DOGS,
};
exports.RULES = RULES;

const reply = (statusCode, body) => ({ statusCode, body: JSON.stringify(body) });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { apartment, checkIn, checkOut } = JSON.parse(event.body || "{}");
    console.log("check-availability:", { apartment, checkIn, checkOut });

    if (typeof apartment !== "string" || !isDate(checkIn) || !isDate(checkOut)) {
      return reply(400, { error: "Missing fields" });
    }
    const nights = daysBetween(checkIn, checkOut);
    if (nights < 1) return reply(200, { available: false, reason: "invalid_dates" });

    // ── iCal: booked nights ─────────────────────────────────────────────────
    const icalUrl = process.env[`SMOOBU_ICAL_${apartment.toUpperCase()}`];
    if (!icalUrl) {
      console.error("Unknown apartment:", apartment);
      return reply(400, { error: "Unknown apartment" });
    }
    const icalText = await (await fetch(icalUrl)).text();
    const booked = parseIcalBlocked(icalText);
    if (booked.some((r) => checkIn < r.end && checkOut > r.start)) {
      return reply(200, { available: false, reason: "dates_blocked" });
    }

    // ── Smoobu rates: price, minimum stay and availability of each night ────
    const aptId = process.env[`SMOOBU_APT_ID_${apartment.toUpperCase()}`];
    if (!aptId) {
      console.error("Smoobu env vars missing:", { aptId: !!aptId });
      return reply(500, { error: "Smoobu API not configured" });
    }

    let ratesRes;
    try {
      ratesRes = await smoobuFetch("GET", "/api/rates", {
        "apartments[]": [aptId],
        start_date: checkIn,
        end_date: checkOut,
      });
    } catch (err) {
      if (err instanceof SmoobuConfigError) {
        console.error("Smoobu API not configured:", err.message);
        return reply(500, { error: "Smoobu API not configured", detail: err.message });
      }
      throw err;
    }
    const ratesBody = await ratesRes.text();
    if (!ratesRes.ok) {
      console.error("Smoobu rates failed:", ratesRes.status, ratesBody.slice(0, 500));
      // 503, not 502: Cloudflare replaces 502 bodies with its own page
      return reply(503, { error: "Failed to fetch pricing from Smoobu", smoobuStatus: ratesRes.status, smoobuBody: ratesBody.slice(0, 200) });
    }

    const ratesData = JSON.parse(ratesBody);
    // Smoobu may return keys as number or string — try both
    const aptRates = ratesData?.data?.[aptId] ?? ratesData?.data?.[Number(aptId)];
    if (!aptRates) {
      console.error("No aptRates found. aptId:", aptId, "keys in data:", Object.keys(ratesData?.data || {}));
      return reply(503, { error: "No pricing data from Smoobu", keys: Object.keys(ratesData?.data || {}) });
    }

    // Minimum stay: the one Smoobu sets for the arrival day
    const minNights = Number(aptRates[checkIn]?.min_length_of_stay) || 1;
    if (nights < minNights) {
      return reply(200, { available: false, reason: "min_stay", minNights, ...RULES });
    }

    let nightsCents = 0;
    for (let i = 0; i < nights; i++) {
      const dateStr = addDays(checkIn, i);
      const dayRate = aptRates[dateStr];
      if (!dayRate || dayRate.available === 0) {
        return reply(200, { available: false, reason: "dates_blocked", date: dateStr });
      }
      if (!dayRate.price) {
        return reply(200, { available: false, reason: "pricing_unavailable", date: dateStr });
      }
      nightsCents += Math.round(dayRate.price * 100);
    }

    const price = priceNights(nightsCents, nights, checkIn);
    console.log("check-availability result:", { apartment, checkIn, checkOut, nights, minNights, ...price });

    return reply(200, {
      available: true,
      nights,
      minNights,
      ...price,                                   // nightsCents, discounts, accommodationCents
      totalCents: price.accommodationCents,       // older pages read this
      stayCents: price.accommodationCents + RULES.cleaningCents,
      currency: "eur",
      ...RULES,
    });
  } catch (err) {
    console.error("check-availability unhandled error:", err.message, err.stack);
    return reply(500, { error: "Internal error", detail: err.message });
  }
};

// Booked ranges as YYYY-MM-DD strings: { start, end } with end = check-out day
function parseIcalBlocked(icalText) {
  const ranges = [];
  const events = icalText.split("BEGIN:VEVENT");
  for (let i = 1; i < events.length; i++) {
    const dtstart = events[i].match(/DTSTART[^:]*:(\d{8})/);
    const dtend = events[i].match(/DTEND[^:]*:(\d{8})/);
    if (dtstart && dtend) ranges.push({ start: ymd(dtstart[1]), end: ymd(dtend[1]) });
  }
  return ranges;
}
const ymd = (s) => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;

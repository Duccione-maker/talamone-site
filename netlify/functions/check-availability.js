// /.netlify/functions/check-availability
//
// Fetches iCal from Smoobu for the requested apartment,
// parses blocked dates, then calls Smoobu /api/rates for real pricing.
//
// ENV VARS needed:
//   SMOOBU_ICAL_FIENILE      = https://login.smoobu.com/en/cockpit/ical/...
//   SMOOBU_ICAL_GHIRI        = https://login.smoobu.com/en/cockpit/ical/...
//   SMOOBU_ICAL_NIDI         = https://login.smoobu.com/en/cockpit/ical/...
//   SMOOBU_ICAL_PADRONALE    = https://login.smoobu.com/en/cockpit/ical/...
//   SMOOBU_API_KEY           = API key from Smoobu Settings
//   SMOOBU_APT_ID_FIENILE    = 195816
//   SMOOBU_APT_ID_GHIRI      = 195814
//   SMOOBU_APT_ID_NIDI       = 195815
//   SMOOBU_APT_ID_PADRONALE  = 192379

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { apartment, checkIn, checkOut } = JSON.parse(event.body);
    console.log("check-availability:", { apartment, checkIn, checkOut });

    if (!apartment || !checkIn || !checkOut) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };
    }

    // ── iCal availability check ─────────────────────────────────────────────
    const icalUrl = process.env[`SMOOBU_ICAL_${apartment.toUpperCase()}`];
    if (!icalUrl) {
      console.error("Unknown apartment:", apartment);
      return { statusCode: 400, body: JSON.stringify({ error: "Unknown apartment" }) };
    }

    const icalRes = await fetch(icalUrl);
    const icalText = await icalRes.text();
    const blockedRanges = parseIcalBlocked(icalText);

    const reqStart = new Date(checkIn);
    const reqEnd = new Date(checkOut);
    const nights = Math.round((reqEnd - reqStart) / (1000 * 60 * 60 * 24));

    if (nights < 1) {
      return { statusCode: 200, body: JSON.stringify({ available: false, reason: "invalid_dates" }) };
    }

    const isBlocked = blockedRanges.some((r) => reqStart < r.end && reqEnd > r.start);
    if (isBlocked) {
      return { statusCode: 200, body: JSON.stringify({ available: false, reason: "dates_blocked" }) };
    }

    // ── Smoobu rates ────────────────────────────────────────────────────────
    const aptId = process.env[`SMOOBU_APT_ID_${apartment.toUpperCase()}`];
    const apiKey = process.env.SMOOBU_API_KEY;

    if (!aptId || !apiKey) {
      console.error("Smoobu env vars missing:", { aptId: !!aptId, apiKey: !!apiKey });
      return { statusCode: 500, body: JSON.stringify({ error: "Smoobu API not configured" }) };
    }

    const ratesUrl = `https://login.smoobu.com/api/rates?apartments[]=${aptId}&start_date=${checkIn}&end_date=${checkOut}`;
    console.log("Fetching Smoobu rates:", ratesUrl);

    const ratesRes = await fetch(ratesUrl, {
      headers: {
        "Api-Key": apiKey,
        "Cache-Control": "no-cache",
      },
    });

    const ratesBody = await ratesRes.text();
    console.log("Smoobu rates status:", ratesRes.status);
    console.log("Smoobu rates body:", ratesBody.slice(0, 500));

    if (!ratesRes.ok) {
      return { statusCode: 502, body: JSON.stringify({ error: "Failed to fetch pricing from Smoobu", detail: ratesBody }) };
    }

    const ratesData = JSON.parse(ratesBody);

    // Smoobu may return keys as number or string — try both
    const aptRates = ratesData?.data?.[aptId] ?? ratesData?.data?.[Number(aptId)];

    if (!aptRates) {
      console.error("No aptRates found. aptId:", aptId, "keys in data:", Object.keys(ratesData?.data || {}));
      return { statusCode: 502, body: JSON.stringify({ error: "No pricing data from Smoobu" }) };
    }

    let totalCents = 0;
    const start = new Date(checkIn);
    for (let i = 0; i < nights; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().slice(0, 10);
      const dayRate = aptRates[dateStr];
      console.log(`Night ${i + 1} (${dateStr}):`, dayRate);
      if (!dayRate || !dayRate.price) {
        return { statusCode: 200, body: JSON.stringify({ available: false, reason: "pricing_unavailable", date: dateStr }) };
      }
      totalCents += Math.round(dayRate.price * 100);
    }

    console.log("check-availability result:", { available: true, nights, totalCents });

    return {
      statusCode: 200,
      body: JSON.stringify({
        available: true,
        nights,
        totalCents,
        nightlyRate: Math.round(totalCents / nights),
        currency: "eur",
      }),
    };
  } catch (err) {
    console.error("check-availability unhandled error:", err.message, err.stack);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal error", detail: err.message }) };
  }
};

function parseIcalBlocked(icalText) {
  const ranges = [];
  const events = icalText.split("BEGIN:VEVENT");
  for (let i = 1; i < events.length; i++) {
    const dtstart = events[i].match(/DTSTART[^:]*:(\d{8})/);
    const dtend = events[i].match(/DTEND[^:]*:(\d{8})/);
    if (dtstart && dtend) {
      ranges.push({
        start: parseIcalDate(dtstart[1]),
        end: parseIcalDate(dtend[1]),
      });
    }
  }
  return ranges;
}

function parseIcalDate(str) {
  return new Date(
    parseInt(str.substring(0, 4)),
    parseInt(str.substring(4, 6)) - 1,
    parseInt(str.substring(6, 8))
  );
}

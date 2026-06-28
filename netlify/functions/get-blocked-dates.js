// /.netlify/functions/get-blocked-dates
//
// Returns all blocked date ranges for a given apartment by parsing its iCal.
// Used by the frontend calendar to visually disable unavailable dates.
//
// ENV VARS needed:
//   SMOOBU_ICAL_CALA

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers, body: "Method not allowed" };
  }

  const apartment = event.queryStringParameters?.apartment;
  if (!apartment) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing apartment param" }) };
  }

  const icalUrl = process.env[`SMOOBU_ICAL_${apartment.toUpperCase()}`];
  if (!icalUrl) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown apartment" }) };
  }

  try {
    const res = await fetch(icalUrl);
    const icalText = await res.text();
    const blocked = parseIcalBlocked(icalText);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ blocked }),
    };
  } catch (err) {
    console.error("get-blocked-dates error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Internal error" }) };
  }
};

function parseIcalBlocked(icalText) {
  const ranges = [];
  const events = icalText.split("BEGIN:VEVENT");

  for (let i = 1; i < events.length; i++) {
    const dtstart = events[i].match(/DTSTART[^:]*:(\d{8})/);
    const dtend = events[i].match(/DTEND[^:]*:(\d{8})/);
    if (dtstart && dtend) {
      const start = parseIcalDate(dtstart[1]);
      const end = parseIcalDate(dtend[1]);
      // Expand range into individual dates (each blocked night)
      const dates = [];
      const cur = new Date(start);
      while (cur < end) {
        dates.push(cur.toISOString().slice(0, 10));
        cur.setDate(cur.getDate() + 1);
      }
      ranges.push(...dates);
    }
  }

  return [...new Set(ranges)]; // deduplicate
}

function parseIcalDate(str) {
  return new Date(
    parseInt(str.substring(0, 4)),
    parseInt(str.substring(4, 6)) - 1,
    parseInt(str.substring(6, 8))
  );
}

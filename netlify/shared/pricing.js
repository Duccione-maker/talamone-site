// Direct-booking price of a stay, shared by check-availability and
// create-checkout. Same file as laripa-site except DOG_CENTS (dogs are free here).
//
// Nightly prices come from Smoobu. There is no automatic direct-booking
// discount: the public price on the site is the same as on the portals.
// Discounts apply to the nights only (never to cleaning or dogs) and
// multiply, they do not add up:
//   weekly            −5%   7 nights or more
//   then at most one of:
//   early booking     −5%   arrival 150 days or more from today
//   last minute       −10%  arrival within 10 days
// The discounted nights are rounded to the whole euro (with no discount the
// Smoobu total is used as is).

const DISCOUNTS = {
  weekly: 5,
  weeklyMinNights: 7,
  early: 5,
  earlyMinDays: 150,
  lastMinute: 10,
  lastMinuteMaxDays: 10,
};

const DOG_CENTS = 0; // dogs stay free (Cala di Forno), at most MAX_DOGS
const MAX_DOGS = 2;

const isDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

// "YYYY-MM-DD" + n days, in UTC so the server time zone never shifts it
function addDays(ymd, n) {
  const d = new Date(ymd + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const daysBetween = (a, b) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000);

// today's date in Italy, YYYY-MM-DD
const todayRome = (now = new Date()) => now.toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });

// Discounts that apply to a stay: [{ key, pct }]
function stayDiscounts(nights, checkIn, today) {
  const out = [];
  if (nights >= DISCOUNTS.weeklyMinNights) out.push({ key: "weekly", pct: DISCOUNTS.weekly });
  const daysAhead = daysBetween(today, checkIn);
  if (daysAhead >= DISCOUNTS.earlyMinDays) out.push({ key: "early", pct: DISCOUNTS.early });
  else if (daysAhead <= DISCOUNTS.lastMinuteMaxDays) out.push({ key: "lastMinute", pct: DISCOUNTS.lastMinute });
  return out;
}

// nightsCents: sum of the Smoobu nightly prices.
// Returns { nightsCents, discounts: [{ key, pct, cents }], accommodationCents }
// where accommodationCents = nightsCents − sum of the discounts' cents.
function priceNights(nightsCents, nights, checkIn, today = todayRome()) {
  const list = stayDiscounts(nights, checkIn, today);
  let running = nightsCents;
  const discounts = list.map((d) => {
    const next = Math.round(running * (100 - d.pct) / 100);
    const cents = running - next;
    running = next;
    return { ...d, cents };
  });
  // no discount: the Smoobu total as is, so nights − discounts = accommodation
  if (!discounts.length) return { nightsCents, discounts, accommodationCents: nightsCents };
  // whole euros; the rounding goes into the last discount
  const accommodationCents = Math.round(running / 100) * 100;
  discounts[discounts.length - 1].cents += running - accommodationCents;
  return { nightsCents, discounts, accommodationCents };
}

// City tax, paid at the property (never charged online)
function cityTax(rules, nights, adults, childAges) {
  const persons = adults + childAges.filter((a) => a >= rules.cityTaxMinAge).length;
  const taxNights = Math.min(nights, rules.cityTaxMaxNights);
  return { persons, taxNights, cents: persons * taxNights * rules.cityTaxCents };
}

module.exports = { DISCOUNTS, DOG_CENTS, MAX_DOGS, isDate, addDays, daysBetween, todayRome, stayDiscounts, priceNights, cityTax };

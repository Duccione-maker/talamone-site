// /.netlify/functions/create-checkout
//
// Creates a Stripe Checkout session for a direct booking (deposit + balance,
// see ../shared/payment-plan.js) of Cala di Forno, Talamone.
// The price is computed HERE, never taken from the browser:
//   accommodation  = Smoobu rates for each night, less the direct, weekly and
//                    early/last-minute discounts (check-availability,
//                    ../shared/pricing.js)
//   discount code  = checked in Supabase (same as verify-discount)
//   cleaning       = €39
//   dogs           = free of charge, at most 2
// City tax (guests aged 14+ × min(nights, 5), amount in RULES) is NOT charged here:
// it is paid at the property. (Figures: RULES in check-availability.js)
//
// ENV VARS needed:
//   STRIPE_SECRET_KEY = sk_live_... or sk_test_...
//   SITE_URL          = https://notuscany.com/en/talamone
//   + those of check-availability and verify-discount

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { handler: checkAvailability, RULES } = require("./check-availability");
const { handler: verifyDiscount } = require("./verify-discount");
const { paymentPlan, checkoutParams, eur, dmy } = require("../shared/payment-plan");

// label and maximum guests (children included) for each apartment
const APTS = {
  cala: { label: "Cala di Forno", maxGuests: 4 },
};
const { cityTax } = require("../shared/pricing");
const CLEANING_CENTS = RULES.cleaningCents;

const json = (statusCode, body) => ({ statusCode, body: JSON.stringify(body) });
const isDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { checkIn, checkOut, discountCode } = body;
    const apartment = body.apartment || "cala";
    const lang = body.lang === "it" ? "it" : "en";
    const apt = APTS[apartment];
    // older pages send only "guests": count them all as adults
    const adults = Number(body.adults !== undefined ? body.adults : body.guests);
    const childAges = Array.isArray(body.childAges) ? body.childAges.map(Number) : [];
    const dogs = body.dogs === undefined ? 0 : Number(body.dogs);

    if (!apt) return json(400, { error: "Unknown apartment" });
    if (!isDate(checkIn) || !isDate(checkOut)) return json(400, { error: "Invalid dates" });
    if (!Number.isInteger(adults) || adults < 1) return json(400, { error: "Invalid guests" });
    if (childAges.some((a) => !Number.isInteger(a) || a < 0 || a > 17)) return json(400, { error: "Invalid guests" });
    const guests = adults + childAges.length;
    if (guests > apt.maxGuests) return json(400, { error: "Too many guests" });
    if (!Number.isInteger(dogs) || dogs < 0 || dogs > RULES.maxDogs) return json(400, { error: "Invalid dogs" });

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("create-checkout: STRIPE_SECRET_KEY not set");
      return json(500, { error: "Stripe not configured" });
    }

    // 1. Availability and accommodation price from Smoobu
    const availRes = await checkAvailability({
      httpMethod: "POST",
      body: JSON.stringify({ apartment, checkIn, checkOut }),
    });
    const avail = JSON.parse(availRes.body);
    if (availRes.statusCode !== 200 || !avail.available) {
      return json(409, { error: "Dates not available", detail: avail });
    }
    const nights = avail.nights;
    const accommodationCents = avail.accommodationCents;

    // 2. Discount code, checked again on the server
    let discountCents = 0;
    let code = "";
    if (discountCode && String(discountCode).trim()) {
      const dRes = await verifyDiscount({
        httpMethod: "POST",
        body: JSON.stringify({ code: String(discountCode), apartment }),
      });
      const d = JSON.parse(dRes.body);
      if (!d.valid) return json(400, { error: "Invalid discount code" });
      code = String(discountCode).trim().toUpperCase();
      discountCents = d.discount_type === "percent"
        ? Math.round(accommodationCents * Number(d.discount_value) / 100)
        : Math.min(Math.round(Number(d.discount_value) * 100), accommodationCents);
    }

    // 3. Cleaning and dogs; city tax paid at the property
    const dogsCents = dogs * RULES.dogCents;
    const tax = cityTax(RULES, nights, adults, childAges);
    const totalCents = accommodationCents - discountCents + CLEANING_CENTS + dogsCents;
    const plan = paymentPlan(totalCents, checkIn);

    const siteUrl = process.env.SITE_URL || "https://notuscany.com/en/talamone";
    console.log("create-checkout:", { apartment, checkIn, checkOut, nights, guests, dogs, nightsCents: avail.nightsCents, accommodationCents, discountCents, dogsCents, cityTaxOnSiteCents: tax.cents, totalCents });

    const name = "Cala di Forno — Talamone";
    const details = [
      `${nights} notti · ${checkIn} → ${checkOut} · ${guests} ospiti`,
      `Notti: ${eur(avail.nightsCents)}`,
      ...avail.discounts.map((d) => `Sconto ${d.pct}%: −${eur(d.cents)}`),
      discountCents ? `Codice ${code}: −${eur(discountCents)}` : null,
      `Pulizie: ${eur(CLEANING_CENTS)}`,
      dogsCents ? `Cani (${dogs}): ${eur(dogsCents)}` : null,
      `Totale: ${eur(totalCents)}`,
      `Tassa di soggiorno ${eur(tax.cents)} da pagare in struttura`,
      plan.plan === "deposit" ? `Saldo ${eur(plan.balanceCents)} il ${dmy(plan.balanceDueDate)}` : null,
    ].filter(Boolean).join(" · ");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: plan.payNowCents,
            product_data: {
              name: plan.plan === "deposit" ? `${lang === "it" ? "Acconto" : "Deposit"} — ${name}` : name,
              description: details,
            },
          },
          quantity: 1,
        },
      ],
      ...checkoutParams(plan, lang, {
        property: "talamone",
        apartment,
        checkIn,
        checkOut,
        guests: String(guests),
        nights: String(nights),
        dogs: String(dogs),
        dogsCents: String(dogsCents),
        cityTaxCents: "0",                        // not in totalCents
        cityTaxOnSiteCents: String(tax.cents),
        cleaningCents: String(CLEANING_CENTS),
        discountCode: code,
        totalCents: String(totalCents),
      }),
      success_url: `${siteUrl}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#booking`,
    });
    console.log("Stripe session created:", session.id);
    return json(200, { sessionId: session.id, url: session.url, totalCents, ...plan });
  } catch (err) {
    console.error("create-checkout unhandled error:", err.message, err.stack);
    return json(500, { error: "Internal error" });
  }
};

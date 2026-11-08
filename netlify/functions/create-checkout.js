// /.netlify/functions/create-checkout
//
// Creates a Stripe Checkout session for a direct booking (deposit + balance,
// see ../shared/payment-plan.js) of Cala di Forno.
// The price is computed HERE, never taken from the browser:
//   accommodation  = Smoobu rates for each night (same as check-availability)
//   discount       = code checked in Supabase (same as verify-discount)
//   cleaning       = €49
//   city tax       = €1.50 × guests aged 14+ × min(nights, 5)
//
// ENV VARS needed:
//   STRIPE_SECRET_KEY = sk_live_... or sk_test_...
//   SITE_URL          = https://notuscany.com/en/talamone
//   + those of check-availability and verify-discount

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { handler: checkAvailability } = require("./check-availability");
const { handler: verifyDiscount } = require("./verify-discount");
const { paymentPlan, checkoutParams, eur, dmy } = require("../shared/payment-plan");

const APARTMENT = "cala";
const MIN_NIGHTS = 5;
const MAX_GUESTS = 4; // children included
const CLEANING_CENTS = 4900;
const CITY_TAX_CENTS = 150;
const MAX_TAX_NIGHTS = 5;

const json = (statusCode, body) => ({ statusCode, body: JSON.stringify(body) });
const isDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { checkIn, checkOut, discountCode } = body;
    const lang = body.lang === "it" ? "it" : "en";
    const adults = Number(body.adults);
    const childAges = Array.isArray(body.childAges) ? body.childAges.map(Number) : [];

    if (!isDate(checkIn) || !isDate(checkOut)) return json(400, { error: "Invalid dates" });
    if (!Number.isInteger(adults) || adults < 1) return json(400, { error: "Invalid guests" });
    if (childAges.some((a) => !Number.isInteger(a) || a < 0 || a > 17)) return json(400, { error: "Invalid guests" });
    const guests = adults + childAges.length;
    if (guests > MAX_GUESTS) return json(400, { error: "Too many guests" });

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("create-checkout: STRIPE_SECRET_KEY not set");
      return json(500, { error: "Stripe not configured" });
    }

    // 1. Availability and accommodation price from Smoobu
    const availRes = await checkAvailability({
      httpMethod: "POST",
      body: JSON.stringify({ apartment: APARTMENT, checkIn, checkOut }),
    });
    const avail = JSON.parse(availRes.body);
    if (availRes.statusCode !== 200 || !avail.available) {
      return json(409, { error: "Dates not available", detail: avail });
    }
    const nights = avail.nights;
    if (nights < MIN_NIGHTS) return json(400, { error: "Minimum stay is 5 nights" });
    const accommodationCents = avail.totalCents;

    // 2. Discount code, checked again on the server
    let discountCents = 0;
    let code = "";
    if (discountCode && String(discountCode).trim()) {
      const dRes = await verifyDiscount({
        httpMethod: "POST",
        body: JSON.stringify({ code: String(discountCode), apartment: APARTMENT }),
      });
      const d = JSON.parse(dRes.body);
      if (!d.valid) return json(400, { error: "Invalid discount code" });
      code = String(discountCode).trim().toUpperCase();
      discountCents = d.discount_type === "percent"
        ? Math.round(accommodationCents * Number(d.discount_value) / 100)
        : Math.min(Math.round(Number(d.discount_value) * 100), accommodationCents);
    }

    // 3. Cleaning and city tax
    const taxable = adults + childAges.filter((a) => a >= 14).length;
    const cityTaxCents = taxable * Math.min(nights, MAX_TAX_NIGHTS) * CITY_TAX_CENTS;
    const totalCents = accommodationCents - discountCents + CLEANING_CENTS + cityTaxCents;
    const plan = paymentPlan(totalCents, checkIn);

    const siteUrl = process.env.SITE_URL || "https://notuscany.com/en/talamone";
    console.log("create-checkout:", { checkIn, checkOut, nights, guests, accommodationCents, discountCents, cityTaxCents, totalCents });

    const name = "Cala di Forno — Talamone";
    const details = [
      `${nights} notti · ${checkIn} → ${checkOut} · ${guests} ospiti`,
      `Alloggio: ${eur(accommodationCents)}`,
      discountCents ? `Sconto ${code}: −${eur(discountCents)}` : null,
      `Pulizie: ${eur(CLEANING_CENTS)}`,
      `Tassa soggiorno: ${eur(cityTaxCents)}`,
      `Totale: ${eur(totalCents)}`,
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
        apartment: APARTMENT,
        checkIn,
        checkOut,
        guests: String(guests),
        nights: String(nights),
        cityTaxCents: String(cityTaxCents),
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

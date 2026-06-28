// /.netlify/functions/create-checkout
//
// Creates a Stripe Checkout session for the booking.
//
// ENV VARS needed:
//   STRIPE_SECRET_KEY = sk_live_... or sk_test_...
//   SITE_URL          = https://laripa.notuscany.com

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const APT_LABELS = {
  fienile: "Fienile",
  ghiri: "Ghiri",
  nidi: "Nidi",
  padronale: "Padronale",
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const body = JSON.parse(event.body);
    const { apartment, checkIn, checkOut, guests, nights, totalCents, cityTaxCents, cleaningCents, discountCode } = body;

    console.log("create-checkout input:", { apartment, checkIn, checkOut, guests, nights, totalCents, cityTaxCents, cleaningCents });

    if (!apartment || !checkIn || !checkOut || !nights) {
      console.error("create-checkout: missing required fields", body);
      return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };
    }

    if (!totalCents || typeof totalCents !== "number" || totalCents <= 0) {
      console.error("create-checkout: invalid totalCents:", totalCents);
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid total amount" }) };
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("create-checkout: STRIPE_SECRET_KEY not set");
      return { statusCode: 500, body: JSON.stringify({ error: "Stripe not configured" }) };
    }

    const siteUrl = process.env.SITE_URL || "http://localhost:8888";
    const aptLabel = APT_LABELS[apartment] || apartment;

    console.log("Creating Stripe session for:", aptLabel, `€${(totalCents / 100).toFixed(2)}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: totalCents,
            product_data: {
              name: `La Ripa — ${aptLabel}`,
              description: [
                `${nights} notti · ${checkIn} → ${checkOut} · ${guests || 2} ospiti`,
                cleaningCents ? `Pulizie: €${(cleaningCents / 100).toFixed(2)}` : null,
                cityTaxCents ? `Tassa soggiorno: €${(cityTaxCents / 100).toFixed(2)}` : null,
              ].filter(Boolean).join(" · "),
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        apartment,
        checkIn,
        checkOut,
        guests: String(guests || 2),
        nights: String(nights),
        cityTaxCents: String(cityTaxCents || 0),
        cleaningCents: String(cleaningCents || 0),
        discountCode: discountCode || "",
      },
      success_url: `${siteUrl}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#booking`,
    });

    console.log("Stripe session created:", session.id);

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id, url: session.url }),
    };
  } catch (err) {
    console.error("create-checkout unhandled error:", err.message, err.stack);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

// /.netlify/functions/generate-payment-link
//
// Admin-only endpoint: creates a Stripe Checkout session to send to a guest
// after manually confirming a booking request.
//
// ENV VARS needed:
//   STRIPE_SECRET_KEY  = sk_live_... or sk_test_...
//   ADMIN_SECRET       = any string you choose (e.g. a passphrase)
//   SITE_URL           = https://talamone.notuscany.com

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { adminSecret, guestName, guestEmail, checkIn, checkOut, nights, guests, totalCents } = JSON.parse(event.body);

    if (!process.env.ADMIN_SECRET || adminSecret !== process.env.ADMIN_SECRET) {
      return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    if (!totalCents || totalCents <= 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid amount" }) };
    }

    const siteUrl = process.env.SITE_URL || "https://talamone.notuscany.com";

    // Stripe sessions expire max 24h from now
    const expiresAt = Math.floor(Date.now() / 1000) + 23 * 3600;

    const descParts = [];
    if (nights && checkIn && checkOut) descParts.push(`${nights} notti · ${checkIn} → ${checkOut}`);
    if (guests) descParts.push(`${guests} ospiti`);
    if (guestName) descParts.push(guestName);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: guestEmail || undefined,
      expires_at: expiresAt,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: Math.round(totalCents),
            product_data: {
              name: "Cala di Forno — Talamone",
              description: descParts.join(" · ") || "Prenotazione Cala di Forno",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        checkIn: checkIn || "",
        checkOut: checkOut || "",
        guests: String(guests || ""),
        nights: String(nights || ""),
        guestName: guestName || "",
        source: "admin",
      },
      success_url: `${siteUrl}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#booking`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("generate-payment-link error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

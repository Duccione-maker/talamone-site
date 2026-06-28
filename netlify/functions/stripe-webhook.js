// /.netlify/functions/stripe-webhook
//
// Handles Stripe webhook events after successful payment.
// Sends Telegram notification to Duccio/Katia.
//
// ENV VARS needed:
//   STRIPE_SECRET_KEY       = sk_live_...
//   STRIPE_WEBHOOK_SECRET   = whsec_...
//   TELEGRAM_BOT_TOKEN      = bot token for notifications
//   TELEGRAM_CHAT_ID        = chat ID for booking notifications

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const sig = event.headers["stripe-signature"];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;
    const meta = session.metadata;
    const amount = (session.amount_total / 100).toFixed(2);
    const email = session.customer_details?.email || "N/A";
    const name = session.customer_details?.name || "N/A";

    // Send Telegram notification
    const message = [
      "🌊 *NUOVA PRENOTAZIONE CALA DI FORNO*",
      "",
      `*Appartamento:* ${meta.apartment}`,
      `*Check-in:* ${meta.checkIn}`,
      `*Check-out:* ${meta.checkOut}`,
      `*Notti:* ${meta.nights}`,
      `*Ospiti:* ${meta.guests}`,
      meta.discountCode ? `*Codice sconto:* \`${meta.discountCode}\`` : null,
      `*Totale pagato:* €${amount}`,
      "",
      `*Nome:* ${name}`,
      `*Email:* ${email}`,
      "",
      `Stripe Session: \`${session.id}\``,
    ].filter(Boolean).join("\n");

    try {
      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown",
          }),
        }
      );
    } catch (tgErr) {
      console.error("Telegram notification failed:", tgErr);
      // Don't fail the webhook — payment is still valid
    }

    // TODO: Optionally create reservation in Smoobu via API
    // TODO: Optionally send confirmation email to guest
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};

# La Ripa di San Gimignano — Website

Sito ufficiale La Ripa con booking engine proprietario (Stripe Checkout) e disponibilità via Smoobu iCal.

## Stack

- **Frontend:** React + Vite
- **Hosting:** Netlify (auto-deploy da GitHub)
- **Pagamenti:** Stripe Checkout
- **Disponibilità:** Smoobu iCal sync
- **Notifiche:** Telegram bot
- **Lingue:** IT / EN (switch in navbar)

## Booking Flow

```
1. Guest selects apartment + dates + guests
2. Frontend → /.netlify/functions/check-availability
   → Fetches iCal from Smoobu, checks date overlap
   → Returns: available (bool) + nights + totalCents
3. Frontend → /.netlify/functions/create-checkout
   → Creates Stripe Checkout session with booking metadata
   → Returns: sessionId
4. Frontend redirects to Stripe Checkout
5. Guest pays → Stripe fires webhook
6. /.netlify/functions/stripe-webhook
   → Verifies signature
   → Sends Telegram notification
   → (TODO) Creates reservation in Smoobu via API
   → (TODO) Sends confirmation email
```

## Setup

```bash
# 1. Clone
git clone https://github.com/YOUR_USER/laripa-site.git
cd laripa-site

# 2. Install
npm install

# 3. Environment
cp .env.example .env
# Fill in all values (see below)

# 4. Dev
npm run dev

# 5. Deploy
# Connect to Netlify, set env vars, push to main
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_STRIPE_PK` | Stripe publishable key (starts with `pk_`) |
| `STRIPE_SECRET_KEY` | Stripe secret key (starts with `sk_`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_`) |
| `SMOOBU_ICAL_FIENILE` | Smoobu iCal export URL for Fienile |
| `SMOOBU_ICAL_GHIRI` | Smoobu iCal export URL for Ghiri |
| `SMOOBU_ICAL_NIDI` | Smoobu iCal export URL for Nidi |
| `SMOOBU_ICAL_PADRONALE` | Smoobu iCal export URL for Padronale |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token for notifications |
| `TELEGRAM_CHAT_ID` | Telegram chat ID for booking alerts |
| `SITE_URL` | Production URL (for Stripe redirects) |

## TODO

- [ ] Sostituire CIN placeholder con codici reali
- [ ] Collegare Stripe account SRL (NO TUSCANY SRL)
- [ ] Recuperare iCal URLs da Smoobu per i 4 appartamenti  
- [ ] Creare pagina /booking-success con conferma
- [ ] Pricing dinamico (stagionale)
- [ ] Invio email conferma al guest
- [ ] Creazione prenotazione automatica in Smoobu via API
- [ ] Responsive: verificare mobile
- [ ] SEO: meta tags, Open Graph, sitemap

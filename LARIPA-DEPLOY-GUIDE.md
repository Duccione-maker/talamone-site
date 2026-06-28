# LA RIPA SITE — Guida Operativa per Claude Code

## OBIETTIVO
Deploy del sito La Ripa di San Gimignano su Netlify con booking engine proprietario (Stripe Checkout) e disponibilità via Smoobu iCal. Il sito è già pronto come progetto React+Vite nell'archivio `laripa-site.tar.gz`.

---

## FASE 1: SETUP PROGETTO

### 1.1 Estrai e inizializza
```bash
cd ~/projects  # o dove tieni i repo
tar xzf laripa-site.tar.gz
cd laripa-site
npm install
```

### 1.2 Crea repo GitHub
```bash
git init
git add .
git commit -m "Initial commit: La Ripa site with Stripe booking"
gh repo create laripa-site --private --source=. --push
```
Oppure crea il repo manualmente su github.com/Duccione-maker/laripa-site e fai push.

### 1.3 Verifica in locale
```bash
cp .env.example .env
# Per ora lascia i placeholder, il sito si vede comunque
npm run dev
```
Apri http://localhost:5173 e verifica che:
- [ ] Hero nero con "La Ripa" si vede
- [ ] Logo No Tuscany in navbar a sinistra, swap colore allo scroll
- [ ] Switch IT/EN funziona
- [ ] Navbar: Appartamenti, Piscina, Posizione, Tips (→ notuscany.com), Prenota
- [ ] Foto proprietà sotto hero
- [ ] 4 card appartamenti con foto
- [ ] Sezione piscina (placeholder foto se non ancora fornita)
- [ ] Sezione green
- [ ] Sezione posizione con distanze città
- [ ] Sezione No Tuscany network + Mi Manda Duccio
- [ ] Booking widget (non funziona ancora senza env vars)
- [ ] Footer con contatti, WhatsApp, CIN placeholder

---

## FASE 2: CONFIGURAZIONE NETLIFY

### 2.1 Collega a Netlify
- Vai su app.netlify.com → New site → Import from GitHub
- Seleziona `laripa-site`
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions` (dovrebbe autodetect da netlify.toml)

### 2.2 Dominio
Dominio primario: `laripa.notuscany.com` (sottodominio — coerente col network).
Configurare su Netlify come custom domain.

### 2.3 Redirect da dominio dedicato
Il dominio dedicato (es. `laripasangimignano.it`) fa redirect 301 a `laripa.notuscany.com`.
Configurare su Aruba (o dove è registrato il dominio):
- DNS: CNAME o redirect 301 verso `laripa.notuscany.com`
- Oppure su Netlify: aggiungere come domain alias con redirect primario

---

## FASE 3: STRIPE

### 3.1 Configura Stripe per NO TUSCANY SRL
Usa l'account Stripe di NO TUSCANY SRL (verificare che sia collegato all'IBAN aziendale).

### 3.2 Recupera le chiavi
Da dashboard.stripe.com → Developers → API Keys:
- **Publishable key** (`pk_live_...`) → va in `VITE_STRIPE_PK`
- **Secret key** (`sk_live_...`) → va in `STRIPE_SECRET_KEY`

### 3.3 Crea webhook
Da dashboard.stripe.com → Developers → Webhooks:
- Endpoint URL: `https://TUO_DOMINIO/.netlify/functions/stripe-webhook`
- Eventi da ascoltare: `checkout.session.completed`
- Copia il **Signing secret** (`whsec_...`) → va in `STRIPE_WEBHOOK_SECRET`

### 3.4 Prezzi
I prezzi vengono recuperati dinamicamente dalla Smoobu API, NON sono hardcoded.
Il flusso di check-availability.js deve essere:
1. Fetch iCal → verifica se le date sono bloccate
2. Se disponibili → chiama Smoobu API `/api/rates` per ottenere il prezzo per quelle date
3. Ritorna al frontend: available + nights + totalCents (calcolato da Smoobu)

Serve dalla dashboard Smoobu (Settings → Smoobu API):
- **SMOOBU_API_KEY** — API key
- **SMOOBU_APT_ID_FIENILE** — ID numerico appartamento
- **SMOOBU_APT_ID_GHIRI** — ID numerico appartamento  
- **SMOOBU_APT_ID_NIDI** — ID numerico appartamento
- **SMOOBU_APT_ID_PADRONALE** — ID numerico appartamento

Endpoint Smoobu per i prezzi:
```
GET https://login.smoobu.com/api/rates?apartments[]={APT_ID}&start_date={YYYY-MM-DD}&end_date={YYYY-MM-DD}
Header: Api-Key: {SMOOBU_API_KEY}
```

Aggiornare `check-availability.js` per usare questa API invece dei prezzi hardcoded.
Aggiornare `.env.example` con le nuove variabili.
Rimuovere l'oggetto `NIGHTLY_RATES_CENTS` dal codice.

---

## FASE 4: SMOOBU iCAL

### 4.1 Recupera URL iCal
Da Smoobu → ogni appartamento → Impostazioni → Sincronizzazione → Export iCal.
Servono 4 URL, uno per appartamento.

### 4.2 Imposta env vars
```
SMOOBU_ICAL_FIENILE=https://login.smoobu.com/en/cockpit/ical/XXXXX
SMOOBU_ICAL_GHIRI=https://login.smoobu.com/en/cockpit/ical/XXXXX
SMOOBU_ICAL_NIDI=https://login.smoobu.com/en/cockpit/ical/XXXXX
SMOOBU_ICAL_PADRONALE=https://login.smoobu.com/en/cockpit/ical/XXXXX
```

---

## FASE 5: TELEGRAM NOTIFICHE

### 5.1 Bot
Puoi usare un bot esistente o crearne uno nuovo con @BotFather.
Copia il token → `TELEGRAM_BOT_TOKEN`

### 5.2 Chat ID
Chat ID dove ricevere le notifiche prenotazione → `TELEGRAM_CHAT_ID`
Può essere il tuo personale o un gruppo con Katia.

---

## FASE 6: ENVIRONMENT VARIABLES SU NETLIFY

Vai su Netlify → Site → Site configuration → Environment variables.
Imposta TUTTE queste:

| Variabile | Valore |
|---|---|
| `VITE_STRIPE_PK` | `pk_live_...` |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `SMOOBU_API_KEY` | API key da Smoobu Settings |
| `SMOOBU_APT_ID_FIENILE` | ID numerico appartamento Smoobu |
| `SMOOBU_APT_ID_GHIRI` | ID numerico appartamento Smoobu |
| `SMOOBU_APT_ID_NIDI` | ID numerico appartamento Smoobu |
| `SMOOBU_APT_ID_PADRONALE` | ID numerico appartamento Smoobu |
| `SMOOBU_ICAL_FIENILE` | URL iCal Smoobu |
| `SMOOBU_ICAL_GHIRI` | URL iCal Smoobu |
| `SMOOBU_ICAL_NIDI` | URL iCal Smoobu |
| `SMOOBU_ICAL_PADRONALE` | URL iCal Smoobu |
| `TELEGRAM_BOT_TOKEN` | Token del bot |
| `TELEGRAM_CHAT_ID` | Chat ID notifiche |
| `SITE_URL` | `https://laripa.notuscany.com` |

**IMPORTANTE:** Dopo aver impostato le env vars, fai un redeploy (Deploys → Trigger deploy).

---

## FASE 7: TEST END-TO-END

### 7.1 Test in modalità Stripe test
Prima di andare live, usa le chiavi test di Stripe (`pk_test_` / `sk_test_`).

1. Vai sul sito deployato
2. Seleziona un appartamento e date libere
3. Clicca "Prenota e paga"
4. Dovresti essere rediretto a Stripe Checkout
5. Usa carta test: `4242 4242 4242 4242`, scadenza futura, CVC qualsiasi
6. Dopo il pagamento → verifica notifica Telegram
7. Verifica su dashboard Stripe che il pagamento appaia

### 7.2 Switch a Stripe live
Quando tutto funziona:
1. Sostituisci le chiavi test con quelle live su Netlify
2. Aggiorna il webhook URL con endpoint live
3. Redeploy

---

## FASE 8: COMPLETAMENTI

### 8.1 CIN
Sostituisci i placeholder CIN nel footer di `src/App.jsx`:
```
CIN Fienile: IT000000000000000000
CIN Ghiri: IT000000000000000000
CIN Nidi: IT000000000000000000
CIN Padronale: IT000000000000000000
```

### 8.2 Navbar aggiornata
La navbar deve avere questi link:
- **Appartamenti** → sezione #apartments
- **Piscina** → sezione #pool (nuova, vedi 8.3)
- **Posizione** → sezione #position
- **Tips** → link esterno a https://notuscany.com (Mi Manda Duccio) — apre in nuova tab
- **Prenota / Book** → sezione #booking

Aggiornare l'array `nav` in entrambe le lingue nel file T{}:
```
it: ["Appartamenti", "Piscina", "Posizione", "Tips", "Prenota"]
en: ["Apartments", "Pool", "Location", "Tips", "Book"]
```
"Tips" non va tradotto, resta "Tips" in entrambe le lingue.
Il click su "Tips" deve fare `window.open("https://notuscany.com", "_blank")` invece di scrollTo.

### 8.3 Sezione Piscina
Aggiungere una sezione dedicata alla piscina tra Appartamenti e Green.
Contenuto:
- Label: "LA PISCINA" / "THE POOL"
- Titolo suggerito IT: "Vista sulle colline. Silenzio tutto intorno."
- Titolo suggerito EN: "Hills on the horizon. Silence all around."
- Descrizione breve della piscina panoramica
- **Serve una foto della piscina** — Duccio deve fornirla
- Placeholder immagine fino ad allora

### 8.4 Pagine dedicate appartamenti
Ogni appartamento deve avere una pagina dedicata raggiungibile dal click sulla card.
Route: `/appartamenti/fienile`, `/appartamenti/ghiri`, `/appartamenti/nidi`, `/appartamenti/padronale`

Ogni pagina contiene:
- **Gallery fotografica** (carousel o griglia) — servono 5-8 foto per appartamento, Duccio le fornirà
- **Nome + tagline** dell'appartamento
- **Specifiche complete:**
  - Metratura
  - Numero e tipo letti (matrimoniale, singolo)
  - Numero bagni
  - Lista amenities complete (cucina, lavatrice, WiFi, aria condizionata, riscaldamento, camino, TV, ecc.)
  - Vista
  - Piano
  - Ingresso (indipendente o meno)
- **Bottone "Prenota questo appartamento"** → va alla sezione booking con appartamento preselezionato
- **Navigazione** alle altre pagine appartamento (prev/next o mini-grid)
- Stile coerente col sito: Cormorant Garamond + DM Sans, palette #f4efe8 / #1a1a1a

Per implementare le pagine serve React Router. Aggiungere:
```bash
npm install react-router-dom
```

Struttura file suggerita:
```
src/
├── App.jsx              ← layout + router
├── pages/
│   ├── Home.jsx         ← homepage attuale (estrarre da App.jsx)
│   ├── Apartment.jsx    ← template pagina appartamento
│   └── BookingSuccess.jsx
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── BookingWidget.jsx
│   └── Gallery.jsx      ← carousel/griglia foto
└── data/
    └── apartments.js    ← dati completi appartamenti (nomi, specs, foto paths)
```

**NOTA:** Le specifiche complete per ogni appartamento (amenities, dettagli) devono essere fornite da Duccio. Usare placeholder per ora.
**NOTA:** Le foto gallery (5-8 per appartamento) devono essere fornite da Duccio. Usare la singola foto attuale come prima immagine + placeholder per le altre.

### 8.4 Pagina booking-success
Creare `public/booking-success.html` o una route React per la conferma post-pagamento.
Deve mostrare:
- Messaggio di conferma
- Riepilogo prenotazione (recuperabile da Stripe session_id nel query param)
- Contatti per domande
- Link a No Tuscany / Mi Manda Duccio come teaser

### 8.3 Responsive
Verificare su mobile:
- Navbar: hamburger menu su schermi piccoli
- Card appartamenti: colonna singola
- Sezione Network: stack verticale invece di grid 2 colonne
- Booking widget: campi full-width
- Sezione città: layout più compatto

### 8.4 SEO
- Open Graph meta tags (titolo, descrizione, immagine hero)
- Sitemap.xml
- robots.txt
- Schema.org markup (LodgingBusiness)

### 8.5 Miglioramenti futuri
- [ ] Pricing stagionale (alto/basso/medio) in check-availability
- [ ] Calendario visuale disponibilità per appartamento
- [ ] Email conferma automatica al guest post-pagamento
- [ ] Creazione automatica prenotazione in Smoobu via API post-pagamento
- [ ] Altre lingue (FR/DE/NL/ES) — struttura T{} già predisposta
- [ ] Gallery foto per ogni appartamento (non solo 1)
- [ ] Pagina dedicata per ogni appartamento con più dettagli
- [ ] Cookie banner / privacy policy
- [ ] Analytics (Plausible o simile, no Google Analytics per coerenza NO platforms)

---

## STRUTTURA FILE

```
laripa-site/
├── public/
│   └── images/
│       ├── hero.jpg                  ← foto esterna proprietà
│       ├── fienile.jpg               ← foto Fienile
│       ├── ghiri.jpg                 ← foto Ghiri
│       ├── nidi.jpg                  ← foto Nidi
│       ├── padronale.jpg             ← foto Padronale
│       ├── notuscany-logo.png        ← logo per sfondo scuro
│       └── notuscany-logo-light.png  ← logo per sfondo chiaro
├── src/
│   ├── main.jsx                      ← entry point React
│   └── App.jsx                       ← sito completo (IT/EN, booking, tutti i componenti)
├── netlify/
│   └── functions/
│       ├── check-availability.js     ← verifica disponibilità via iCal Smoobu
│       ├── create-checkout.js        ← crea sessione Stripe Checkout
│       └── stripe-webhook.js         ← gestisce pagamento + notifica Telegram
├── index.html
├── package.json
├── vite.config.js
├── netlify.toml
├── .env.example
├── .gitignore
└── README.md
```

---

## FLUSSO PRENOTAZIONE (RIEPILOGO)

```
Guest sceglie appartamento + date + ospiti
         │
         ▼
check-availability.js
  → Fetch iCal da Smoobu
  → Parse date bloccate
  → Se overlap → "non disponibile"
  → Se libero → chiama Smoobu API /api/rates per prezzo reale
  → Ritorna: available, nights, totalCents (da Smoobu)
         │
         ▼
create-checkout.js
  → Crea Stripe Checkout Session
  → Metadata: appartamento, date, ospiti, notti
  → Importo: totalCents da Smoobu
  → Success URL: /booking-success?session_id={ID}
  → Cancel URL: /#booking
         │
         ▼
Redirect a Stripe Checkout
  → Guest inserisce carta e paga
         │
         ▼
stripe-webhook.js (chiamato da Stripe)
  → Verifica firma webhook
  → Estrae metadata prenotazione
  → Invia notifica Telegram a Duccio
  → (TODO) Crea prenotazione in Smoobu via API
  → (TODO) Invia email conferma a guest
```

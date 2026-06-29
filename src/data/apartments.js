// Apartment data — Cala di Forno Talamone
// Smoobu ID: 3397626

export const APARTMENTS = [
  {
    id: "cala",
    smoobuId: 3397626,
    name: "Cala di Forno",
    sqm: 100,
    maxGuests: 4,
    photo: "/images/esterno.jpg",
    gallery: [
      "/images/esterno.jpg",
      "/images/esterno2.jpg",
      "/images/matrimoniale.jpg",
      "/images/divano%20letto.jpg",
      "/images/divano%20letto%202.jpg",
      "/images/soggiorno%202.jpg",
      "/images/primo%20bagno.jpg",
      "/images/primo%20bagno%202.jpg",
      "/images/primo%20bagno%203.jpg",
      "/images/secondo%20bagno%201.jpg",
      "/images/secondo%20bagno%202.jpg",
      "/images/doccia.jpg",
      "/images/forno%20elettrico.jpg",
      "/images/frigo.jpg",
      "/images/lavastoviglie.jpg",
      "/images/lavatrice.jpg",
      "/images/piano%20cottura.jpg",
      "/images/tavola.jpg",
    ],
    it: {
      tagline: "Cinquanta metri dal mare. Il parco fuori dalla porta.",
      beds: "4 ospiti · 1 matrimoniale + divano letto",
      beds_detail: "1 letto matrimoniale, divano letto in soggiorno · culla disponibile · 5° posto letto a pagamento su richiesta",
      features: ["50 m dal mare", "Parco della Maremma", "Giardino privato", "Doccia solare"],
      bathrooms: "2 bagni con doccia (piano terra + piano -1)",
      floor: "2 livelli (piano terra + piano -1)",
      view: "Giardino e Parco della Maremma",
      description:
        "Cala di Forno è immersa nel Parco Naturale della Maremma, a cinquanta metri dal mare. L'appartamento si sviluppa su due livelli: al piano terra il soggiorno con cucina attrezzata e il primo bagno con doccia, al piano inferiore la camera matrimoniale e il secondo bagno. Il giardino privato si apre direttamente sul paesaggio della macchia mediterranea. La doccia solare esterna è il rito perfetto dopo ogni nuotata.",
    },
    en: {
      tagline: "Fifty metres from the sea. The park right outside the door.",
      beds: "4 guests · 1 double + sofa bed",
      beds_detail: "1 double bed, sofa bed in living room · cot available · 5th bed on request (extra charge)",
      features: ["50 m from the sea", "Maremma National Park", "Private garden", "Solar shower"],
      bathrooms: "2 bathrooms with shower (ground floor + lower level)",
      floor: "2 levels (ground floor + lower level)",
      view: "Garden and Maremma Natural Park",
      description:
        "Cala di Forno sits inside the Maremma Natural Park, fifty metres from the sea. The apartment spans two levels: on the ground floor a living room with a fully equipped kitchen and the first shower bathroom; on the lower level the double bedroom and a second bathroom. The private garden opens directly onto the Mediterranean scrub landscape. The outdoor solar shower is the perfect ritual after every swim.",
    },
    amenities: [
      { icon: "🌊", it: "50 metri dal mare", en: "50 metres from the sea" },
      { icon: "🌿", it: "Parco Naturale della Maremma", en: "Maremma Natural Park" },
      { icon: "🏡", it: "Giardino privato", en: "Private garden" },
      { icon: "🚿", it: "Doccia solare esterna", en: "Outdoor solar shower" },
      { icon: "🍳", it: "Cucina attrezzata", en: "Fully equipped kitchen" },
      { icon: "🧊", it: "Frigo e congelatore", en: "Fridge & freezer" },
      { icon: "📡", it: "Forno a microonde", en: "Microwave" },
      { icon: "🍽️", it: "Stoviglie complete", en: "Full tableware" },
      { icon: "🫧", it: "Lavastoviglie", en: "Dishwasher" },
      { icon: "🧺", it: "Lavatrice", en: "Washing machine" },
      { icon: "🚿", it: "2 docce (piano terra + piano -1)", en: "2 showers (ground floor + lower level)" },
      { icon: "🛏️", it: "Lenzuola incluse", en: "Bed linen included" },
      { icon: "🏖️", it: "Asciugamani inclusi", en: "Towels included" },
      { icon: "👶", it: "Culla disponibile", en: "Cot available" },
      { icon: "💨", it: "Rilevatore di gas e monossido di carbonio", en: "Gas & carbon monoxide detector" },
      { icon: "🧯", it: "Estintore", en: "Fire extinguisher" },
      { icon: "🅿️", it: "Parcheggio", en: "Parking" },
    ],
  },
];

export const APT_IDS = APARTMENTS.map((a) => a.id);
export const APT_NAMES = APARTMENTS.map((a) => a.name);
export const APT_SQMS = APARTMENTS.map((a) => a.sqm);

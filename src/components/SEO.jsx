import { useEffect } from "react";

const SITE_URL = "https://talamone.notuscany.com";
const OG_IMAGE = `${SITE_URL}/images/hero.jpg`;

function setMeta(name, content, attr = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href, extra = {}) {
  const hreflang = extra.hreflang;
  let selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setSchema(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeSchema(id) {
  document.getElementById(id)?.remove();
}

// ─── HOME PAGE SEO ────────────────────────────────────────────────────────────

export function HomeSEO({ lang }) {
  useEffect(() => {
    const isIt = lang === "it";

    document.documentElement.lang = lang;

    document.title = isIt
      ? "Cala di Forno Talamone — Appartamento nel Parco della Maremma | 50 m dal Mare"
      : "Cala di Forno Talamone — Apartment in Maremma Natural Park | 50 m from the Sea";

    setMeta("description", isIt
      ? "Cala di Forno: appartamento nel Parco Naturale della Maremma, a 50 metri dal mare. 100 mq, giardino privato, doccia solare. Prenotazione diretta senza commissioni."
      : "Cala di Forno: apartment in the Maremma Natural Park, 50 metres from the sea. 100 sqm, private garden, solar shower. Direct booking with no fees."
    );

    setMeta("robots", "index, follow");

    setMeta("og:type", "website", "property");
    setMeta("og:url", `${SITE_URL}/`, "property");
    setMeta("og:title", isIt
      ? "Cala di Forno Talamone — Parco della Maremma"
      : "Cala di Forno Talamone — Maremma Natural Park", "property");
    setMeta("og:description", isIt
      ? "50 metri dal mare, giardino privato, Parco della Maremma. Prenota direttamente."
      : "50 metres from the sea, private garden, Maremma Natural Park. Book directly.", "property");
    setMeta("og:image", OG_IMAGE, "property");
    setMeta("og:image:width", "1200", "property");
    setMeta("og:image:height", "630", "property");
    setMeta("og:locale", isIt ? "it_IT" : "en_US", "property");
    setMeta("og:locale:alternate", isIt ? "en_US" : "it_IT", "property");
    setMeta("og:site_name", "Cala di Forno Talamone", "property");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", isIt
      ? "Cala di Forno Talamone — Parco della Maremma"
      : "Cala di Forno Talamone — Maremma Natural Park");
    setMeta("twitter:description", isIt
      ? "50 metri dal mare, giardino privato, Parco della Maremma."
      : "50 metres from the sea, private garden, Maremma Natural Park.");
    setMeta("twitter:image", OG_IMAGE);

    setLink("canonical", `${SITE_URL}/`);
    setLink("alternate", `${SITE_URL}/`, { hreflang: "it" });
    setLink("alternate", `${SITE_URL}/`, { hreflang: "en" });
    setLink("alternate", `${SITE_URL}/`, { hreflang: "x-default" });

    setSchema("schema-home", {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      "@id": `${SITE_URL}/#lodging`,
      "name": "Cala di Forno Talamone",
      "description": isIt
        ? "Appartamento nel Parco Naturale della Maremma a 50 metri dal mare. 100 mq, giardino privato, doccia solare esterna."
        : "Apartment in the Maremma Natural Park, 50 metres from the sea. 100 sqm, private garden, outdoor solar shower.",
      "url": SITE_URL,
      "telephone": "+393517352679",
      "email": "info@notuscany.com",
      "image": OG_IMAGE,
      "priceRange": "€€€",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Talamone",
        "addressRegion": "Toscana",
        "postalCode": "58010",
        "addressCountry": "IT"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 42.5524,
        "longitude": 11.1362
      },
      "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "Accesso al mare", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Giardino privato", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Doccia solare", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "WiFi", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Cucina attrezzata", "value": true }
      ],
      "numberOfRooms": 1,
      "checkinTime": "15:00",
      "checkoutTime": "10:00",
      "petsAllowed": false,
      "availableLanguage": ["Italian", "English"],
      "sameAs": ["https://notuscany.com"]
    });

    return () => removeSchema("schema-home");
  }, [lang]);

  return null;
}

// ─── APARTMENT PAGE SEO ───────────────────────────────────────────────────────

export function ApartmentSEO({ apt, lang }) {
  useEffect(() => {
    if (!apt) return;
    const isIt = lang === "it";
    const t = apt[lang] || apt.en;
    const url = `${SITE_URL}/appartamenti/${apt.id}`;
    const image = apt.photo ? `${SITE_URL}${apt.photo}` : OG_IMAGE;

    document.documentElement.lang = lang;

    document.title = isIt
      ? `${apt.name} — Talamone, Maremma | Appartamento sul Mare`
      : `${apt.name} — Talamone, Maremma | Seafront Apartment`;

    setMeta("description", isIt
      ? `${t.tagline}. ${apt.sqm} m², max ${apt.maxGuests} ospiti. Prenota direttamente, Talamone.`
      : `${t.tagline}. ${apt.sqm} m², up to ${apt.maxGuests} guests. Book directly, Talamone.`
    );

    setMeta("robots", "index, follow");

    setMeta("og:type", "website", "property");
    setMeta("og:url", url, "property");
    setMeta("og:title", `${apt.name} — Talamone, Maremma`, "property");
    setMeta("og:description", `${t.tagline}. ${apt.sqm} m², max ${apt.maxGuests} guests.`, "property");
    setMeta("og:image", image, "property");
    setMeta("og:image:width", "1200", "property");
    setMeta("og:image:height", "630", "property");
    setMeta("og:locale", isIt ? "it_IT" : "en_US", "property");
    setMeta("og:site_name", "Cala di Forno Talamone", "property");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", `${apt.name} — Talamone, Maremma`);
    setMeta("twitter:description", `${t.tagline}. ${apt.sqm} m², max ${apt.maxGuests} guests.`);
    setMeta("twitter:image", image);

    setLink("canonical", url);
    setLink("alternate", url, { hreflang: "it" });
    setLink("alternate", url, { hreflang: "en" });
    setLink("alternate", url, { hreflang: "x-default" });

    setSchema("schema-apartment", {
      "@context": "https://schema.org",
      "@type": "Accommodation",
      "@id": `${url}#accommodation`,
      "name": `${apt.name} — Talamone, Maremma`,
      "description": t.description,
      "url": url,
      "image": image,
      "floorSize": {
        "@type": "QuantitativeValue",
        "value": apt.sqm,
        "unitCode": "MTK"
      },
      "occupancy": {
        "@type": "QuantitativeValue",
        "maxValue": apt.maxGuests
      },
      "numberOfBathroomsTotal": 2,
      "amenityFeature": apt.amenities?.map((a) => ({
        "@type": "LocationFeatureSpecification",
        "name": a.en,
        "value": true
      })) || [],
      "containedInPlace": {
        "@type": "LodgingBusiness",
        "@id": `${SITE_URL}/#lodging`,
        "name": "Cala di Forno Talamone"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Talamone",
        "addressRegion": "Toscana",
        "postalCode": "58010",
        "addressCountry": "IT"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 42.5524,
        "longitude": 11.1362
      }
    });

    return () => removeSchema("schema-apartment");
  }, [apt, lang]);

  return null;
}

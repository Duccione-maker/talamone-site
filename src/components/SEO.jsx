import { useEffect } from "react";

const SITE_URL = "https://laripa.notuscany.com";
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
  // For canonical/hreflang we match on rel+hreflang or rel alone
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
      ? "La Ripa di San Gimignano — Agriturismo in Toscana | 4 Appartamenti con Piscina"
      : "La Ripa San Gimignano — Tuscany Agriturismo | 4 Apartments with Pool";

    setMeta("description", isIt
      ? "La Ripa: 4 appartamenti indipendenti immersi negli ulivi di San Gimignano. Piscina panoramica, energia solare, prenotazione diretta senza commissioni. Nel cuore del Chianti."
      : "La Ripa: 4 independent apartments among the olive groves of San Gimignano. Panoramic pool, solar energy, direct booking with no fees. In the heart of Chianti, Tuscany."
    );

    setMeta("robots", "index, follow");

    // Open Graph
    setMeta("og:type", "website", "property");
    setMeta("og:url", `${SITE_URL}/`, "property");
    setMeta("og:title", isIt
      ? "La Ripa di San Gimignano — Agriturismo in Toscana"
      : "La Ripa San Gimignano — Tuscany Agriturismo", "property");
    setMeta("og:description", isIt
      ? "4 appartamenti indipendenti, piscina panoramica, 250 ulivi. Prenota direttamente."
      : "4 independent apartments, panoramic pool, 250 olive trees. Book directly.", "property");
    setMeta("og:image", OG_IMAGE, "property");
    setMeta("og:image:width", "1200", "property");
    setMeta("og:image:height", "630", "property");
    setMeta("og:locale", isIt ? "it_IT" : "en_US", "property");
    setMeta("og:locale:alternate", isIt ? "en_US" : "it_IT", "property");
    setMeta("og:site_name", "La Ripa di San Gimignano", "property");

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", isIt
      ? "La Ripa di San Gimignano — Agriturismo in Toscana"
      : "La Ripa San Gimignano — Tuscany Agriturismo");
    setMeta("twitter:description", isIt
      ? "4 appartamenti indipendenti, piscina panoramica, 250 ulivi."
      : "4 independent apartments, panoramic pool, 250 olive trees.");
    setMeta("twitter:image", OG_IMAGE);

    // Canonical + hreflang
    setLink("canonical", `${SITE_URL}/`);
    setLink("alternate", `${SITE_URL}/`, { hreflang: "it" });
    setLink("alternate", `${SITE_URL}/`, { hreflang: "en" });
    setLink("alternate", `${SITE_URL}/`, { hreflang: "x-default" });

    // Schema.org LodgingBusiness
    setSchema("schema-home", {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      "@id": `${SITE_URL}/#lodging`,
      "name": "La Ripa di San Gimignano",
      "description": isIt
        ? "Agriturismo con 4 appartamenti indipendenti immersi negli ulivi di San Gimignano, piscina panoramica e 250 ulivi."
        : "Agriturismo with 4 independent apartments among the olive groves of San Gimignano, panoramic pool and 250 olive trees.",
      "url": SITE_URL,
      "telephone": "+393517352679",
      "email": "info@notuscany.com",
      "image": OG_IMAGE,
      "priceRange": "€€€",
      "starRating": { "@type": "Rating", "ratingValue": "4" },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Località La Ripa",
        "addressLocality": "San Gimignano",
        "addressRegion": "Toscana",
        "postalCode": "53037",
        "addressCountry": "IT"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 43.502285416557065,
        "longitude": 11.071656562477644
      },
      "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "Piscina", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Energia solare", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Parcheggio gratuito", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "WiFi", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Cucina attrezzata", "value": true }
      ],
      "numberOfRooms": 4,
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
      ? `${apt.name} — La Ripa di San Gimignano | Appartamento in Toscana`
      : `${apt.name} — La Ripa San Gimignano | Tuscany Apartment`;

    setMeta("description", isIt
      ? `${t.tagline}. ${apt.sqm} m², max ${apt.maxGuests} ospiti. Prenota direttamente su La Ripa, San Gimignano.`
      : `${t.tagline}. ${apt.sqm} m², up to ${apt.maxGuests} guests. Book directly at La Ripa, San Gimignano.`
    );

    setMeta("robots", "index, follow");

    // Open Graph
    setMeta("og:type", "website", "property");
    setMeta("og:url", url, "property");
    setMeta("og:title", `${apt.name} — La Ripa San Gimignano`, "property");
    setMeta("og:description", `${t.tagline}. ${apt.sqm} m², max ${apt.maxGuests} guests.`, "property");
    setMeta("og:image", image, "property");
    setMeta("og:image:width", "1200", "property");
    setMeta("og:image:height", "630", "property");
    setMeta("og:locale", isIt ? "it_IT" : "en_US", "property");
    setMeta("og:site_name", "La Ripa di San Gimignano", "property");

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", `${apt.name} — La Ripa San Gimignano`);
    setMeta("twitter:description", `${t.tagline}. ${apt.sqm} m², max ${apt.maxGuests} guests.`);
    setMeta("twitter:image", image);

    // Canonical + hreflang
    setLink("canonical", url);
    setLink("alternate", url, { hreflang: "it" });
    setLink("alternate", url, { hreflang: "en" });
    setLink("alternate", url, { hreflang: "x-default" });

    // Schema.org Accommodation
    setSchema("schema-apartment", {
      "@context": "https://schema.org",
      "@type": "Accommodation",
      "@id": `${url}#accommodation`,
      "name": `${apt.name} — La Ripa di San Gimignano`,
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
      "numberOfBathroomsTotal": 1,
      "amenityFeature": apt.amenities?.map((a) => ({
        "@type": "LocationFeatureSpecification",
        "name": a.en,
        "value": true
      })) || [],
      "containedInPlace": {
        "@type": "LodgingBusiness",
        "@id": `${SITE_URL}/#lodging`,
        "name": "La Ripa di San Gimignano"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "San Gimignano",
        "addressRegion": "Toscana",
        "postalCode": "53037",
        "addressCountry": "IT"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 43.502285416557065,
        "longitude": 11.071656562477644
      }
    });

    return () => removeSchema("schema-apartment");
  }, [apt, lang]);

  return null;
}

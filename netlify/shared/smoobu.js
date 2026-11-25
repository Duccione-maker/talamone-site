// Smoobu API client with HMAC request signing (required by Smoobu since
// 2026-09-25, see docs.smoobu.com "HMAC authentication").
//
// ENV VARS needed:
//   SMOOBU_API_KEY     = API key from Smoobu Settings
//   SMOOBU_API_SECRET  = API secret from Smoobu Settings (HMAC key)
//
// Every request carries X-API-Key, X-Timestamp, X-Nonce and X-Signature, where
// X-Signature = base64(HMAC-SHA256(secret, canonical)) and canonical is these
// 7 lines joined by "\n": METHOD, path, sorted query, timestamp, nonce,
// sha256 hex of the body, API key. The key and the secret are never logged.

const crypto = require("crypto");

const SMOOBU_BASE = "https://login.smoobu.com";

class SmoobuConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "SmoobuConfigError";
  }
}

// RFC 3986 percent-encoding: unreserved chars A-Z a-z 0-9 - . _ ~ stay as is
const rfc3986 = (s) =>
  encodeURIComponent(String(s)).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

// query: object ({ key: value | [values] }) or array of [key, value] pairs.
// Pairs are sorted by encoded key (stable, so repeated keys keep their order).
function canonicalQuery(query) {
  if (!query) return "";
  const pairs = Array.isArray(query)
    ? query
    : Object.entries(query).flatMap(([k, v]) => (Array.isArray(v) ? v.map((x) => [k, x]) : [[k, v]]));
  return pairs
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => [rfc3986(k), rfc3986(v)])
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}

// smoobuFetch("GET", "/api/rates", { "apartments[]": [id], start_date, end_date })
// Returns the fetch Response. Throws SmoobuConfigError if key/secret are missing.
async function smoobuFetch(method, path, query, body) {
  // trimmed: a space pasted with the key makes Smoobu answer 401
  const apiKey = (process.env.SMOOBU_API_KEY || "").trim();
  const apiSecret = (process.env.SMOOBU_API_SECRET || "").trim();
  if (!apiKey) throw new SmoobuConfigError("SMOOBU_API_KEY is not set");
  if (!apiSecret) throw new SmoobuConfigError("SMOOBU_API_SECRET is not set (required for Smoobu HMAC authentication)");
  if (!path.startsWith("/api/")) throw new Error(`Smoobu path must start with /api/: ${path}`);

  const verb = String(method || "GET").toUpperCase();
  const qs = canonicalQuery(query);
  // the body is hashed exactly as sent; GET/HEAD send none (hash of "")
  const rawBody = verb === "GET" || verb === "HEAD" || body === undefined || body === null
    ? ""
    : typeof body === "string" ? body : JSON.stringify(body);
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const nonce = crypto.randomUUID();
  const bodyHash = crypto.createHash("sha256").update(rawBody, "utf8").digest("hex");

  const canonical = [verb, path, qs, timestamp, nonce, bodyHash, apiKey].join("\n");
  const signature = crypto.createHmac("sha256", apiSecret).update(canonical, "utf8").digest("base64");

  const headers = {
    "X-API-Key": apiKey,
    "X-Timestamp": timestamp,
    "X-Nonce": nonce,
    "X-Signature": signature,
    "Cache-Control": "no-cache",
  };
  if (rawBody) headers["Content-Type"] = "application/json";

  const url = `${SMOOBU_BASE}${path}${qs ? `?${qs}` : ""}`;
  return fetch(url, { method: verb, headers, body: rawBody || undefined });
}

module.exports = { smoobuFetch, canonicalQuery, SmoobuConfigError };

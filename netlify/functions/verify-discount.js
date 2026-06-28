// /.netlify/functions/verify-discount
//
// Verifies a discount code against Supabase discount_codes table.
//
// ENV VARS needed:
//   SUPABASE_URL         = https://hnnpeumoajwiqekwzfgb.supabase.co
//   SUPABASE_SERVICE_KEY = service_role key from Supabase dashboard

const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { code, apartment } = JSON.parse(event.body);

    if (!code || !apartment) {
      return { statusCode: 400, body: JSON.stringify({ valid: false, error: "Missing fields" }) };
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.error("verify-discount: Supabase env vars missing");
      return { statusCode: 200, body: JSON.stringify({ valid: false, debug: "env_missing" }) };
    }

    const normalizedCode = code.trim().toUpperCase();
    console.log("verify-discount: looking up code:", normalizedCode, "for apartment:", apartment);

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { data, error } = await supabase
      .from("discount_codes")
      .select("code, discount_type, value, active, valid_for")
      .eq("code", normalizedCode)
      .single();

    console.log("verify-discount: supabase result:", JSON.stringify({ data, error }));

    if (error || !data) {
      console.log("verify-discount: code not found:", normalizedCode, error?.message);
      return { statusCode: 200, body: JSON.stringify({ valid: false, debug: "not_found" }) };
    }

    if (!data.active) {
      console.log("verify-discount: code inactive:", normalizedCode);
      return { statusCode: 200, body: JSON.stringify({ valid: false, debug: "inactive" }) };
    }

    // Check if code is valid for this property
    const validFor = data.valid_for;
    if (validFor !== "all" && validFor !== "laripa") {
      console.log("verify-discount: code not valid for laripa:", normalizedCode, "valid_for:", validFor);
      return { statusCode: 200, body: JSON.stringify({ valid: false, debug: "wrong_property" }) };
    }

    console.log("verify-discount: valid code:", normalizedCode, data.discount_type, data.value);

    return {
      statusCode: 200,
      body: JSON.stringify({
        valid: true,
        discount_type: data.discount_type,
        discount_value: data.value,
      }),
    };
  } catch (err) {
    console.error("verify-discount unhandled error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ valid: false, error: "Internal error" }) };
  }
};

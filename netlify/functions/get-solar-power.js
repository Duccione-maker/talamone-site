// /.netlify/functions/get-solar-power
//
// Fetches real-time solar production from Huawei FusionSolar Northbound API.
// Docs: https://eu5.fusionsolar.huawei.com/thirdData
//
// ENV VARS needed:
//   FUSIONSOLAR_USER         = API username (created in FusionSolar → Third Party Access)
//   FUSIONSOLAR_SYSTEM_CODE  = API system code (password for API user)
//   FUSIONSOLAR_STATION_CODE = Plant/station code from FusionSolar

const BASE_URL = "https://eu5.fusionsolar.huawei.com/thirdData";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  };

  const user = process.env.FUSIONSOLAR_USER;
  const systemCode = process.env.FUSIONSOLAR_SYSTEM_CODE;
  const stationCode = process.env.FUSIONSOLAR_STATION_CODE;

  if (!user || !systemCode || !stationCode) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ available: false, reason: "not_configured" }),
    };
  }

  try {
    // Step 1: Login to get xsrf-token
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: user, systemCode }),
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed: ${loginRes.status}`);
    }

    const loginData = await loginRes.json();
    if (!loginData.success) {
      throw new Error(`Login error: ${loginData.failCode}`);
    }

    // Extract xsrf-token from response headers
    const xsrfToken = loginRes.headers.get("xsrf-token");
    if (!xsrfToken) {
      throw new Error("No xsrf-token in login response");
    }

    // Step 2: Get real-time KPI for the station
    const kpiRes = await fetch(`${BASE_URL}/getStationRealKpi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xsrf-token": xsrfToken,
      },
      body: JSON.stringify({ stationCodes: stationCode }),
    });

    const kpiData = await kpiRes.json();

    if (!kpiData.success || !kpiData.data?.length) {
      throw new Error("No KPI data returned");
    }

    const station = kpiData.data[0];
    const dataItemMap = station.dataItemMap;

    // Real-time power in kW
    const activePower = parseFloat(dataItemMap.real_health_state ?? dataItemMap.inverter_power ?? 0);
    const dayEnergy = parseFloat(dataItemMap.day_power ?? 0);     // kWh today
    const totalEnergy = parseFloat(dataItemMap.total_power ?? 0); // kWh total lifetime

    // Current power output (W → kW)
    const currentKw = parseFloat(dataItemMap.real_health_state ?? 0);

    // Try common field names across FusionSolar API versions
    const powerKw =
      parseFloat(dataItemMap.inverter_power ?? 0) ||
      parseFloat(dataItemMap.active_power ?? 0) ||
      0;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        available: true,
        powerKw: powerKw,          // current output in kW
        dayEnergyKwh: dayEnergy,   // produced today in kWh
        totalEnergyKwh: totalEnergy, // lifetime production in kWh
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (err) {
    console.error("FusionSolar error:", err.message);
    return {
      statusCode: 200,
      headers,
      // Return gracefully — frontend shows static data if unavailable
      body: JSON.stringify({ available: false, reason: err.message }),
    };
  }
};

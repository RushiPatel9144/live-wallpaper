import fetch from "node-fetch";

export default async function handler(req, res) {
  const icalUrl = process.env.GOOGLE_ICAL_URL;

  if (!icalUrl) {
    res.status(500).send("GOOGLE_ICAL_URL is not set");
    return;
  }

  try {
    const upstream = await fetch(icalUrl);

    if (!upstream.ok) {
      res
        .status(502)
        .send("Upstream Google Calendar fetch failed: " + upstream.status);
      return;
    }

    const icsText = await upstream.text();

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send(icsText);
  } catch (err) {
    console.error("Calendar proxy error:", err);
    res.status(500).send("Calendar proxy error");
  }
}

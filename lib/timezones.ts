// All IANA time zones (worldwide). Falls back to a short list on old runtimes.
const FALLBACK = [
  "America/Mexico_City", "America/Chicago", "America/New_York", "America/Los_Angeles",
  "America/Bogota", "America/Lima", "America/Sao_Paulo", "America/Argentina/Buenos_Aires",
  "Europe/Madrid", "Europe/London", "Europe/Paris", "Africa/Johannesburg",
  "Asia/Kolkata", "Asia/Shanghai", "Australia/Sydney", "UTC",
];

export const TIMEZONES: string[] = (() => {
  try {
    const fn = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf;
    const zones = fn ? fn("timeZone") : null;
    return zones && zones.length ? zones : FALLBACK;
  } catch {
    return FALLBACK;
  }
})();

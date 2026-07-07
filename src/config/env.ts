export const ENV = {
  BASE_API: import.meta.env.VITE_BASE_API as string,
  // CLI-03 SECURITY: GOOGLE_API_KEY is a VITE_* var and is therefore inlined into
  // the browser bundle — a client-side Google API key is publicly visible by design.
  // This is acceptable ONLY if the key is restricted in the Google Cloud Console
  // (HTTP referrer allowlist + API restrictions). MANUAL ACTION REQUIRED: confirm
  // the key is referrer-restricted and rotate it (it has been exposed in prior
  // bundles and committed .env files). The .env* files are gitignored; use
  // .env.example for placeholders.
  GOOGLE_API_KEY: import.meta.env.VITE_GOOGLE_API_KEY as string
}

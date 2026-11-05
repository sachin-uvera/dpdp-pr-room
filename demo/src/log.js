const AADHAAR = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
const EMAIL = /[^\s@"]+@[^\s@"]+/g;

export function redact(text) {
  return String(text).replace(AADHAAR, "XXXX-XXXX-XXXX").replace(EMAIL, "[email]");
}

export function log(message, fields = {}) {
  console.log(redact(`${message} ${JSON.stringify(fields)}`));
}

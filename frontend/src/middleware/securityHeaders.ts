import { defineMiddleware } from "astro:middleware";

function setDefault(headers: Headers, key: string, value: string) {
  if (!headers.has(key)) {
    headers.set(key, value);
  }
}

// Lax CSP for now, we could tighten this up.
const cspDirectives = [
  "default-src 'self';",
  "script-src 'self' 'unsafe-inline';",
  "style-src 'self' 'unsafe-inline';",
  "font-src 'self' data:;",
  "object-src 'none';",
]
  .filter(Boolean)
  .join(" ");

const securityHeaders = defineMiddleware(async (_, next) => {
  const response = await next();
  const { headers } = response;

  // Only set headers for HTML documents.
  const contentType = headers.get("content-type");
  if (contentType && !contentType.includes("text/html")) {
    return response;
  }

  // Enable browsers built-in XSS protection.
  setDefault(headers, "x-xss-protection", "1; mode=block");
  // Prevent browsers from sniffing MIME types. This is to prevent MIME Confusion Attack.
  setDefault(headers, "x-content-type-options", "nosniff");
  // The browser will send the full Referrer URL to requests to the same origin but only send the origin when requests are cross-origin.
  // but will not allow any information to be sent when a scheme downgrade happens (the user is navigating from HTTPS to HTTP).
  setDefault(headers, "referrer-policy", "strict-origin-when-cross-origin");
  // Prevents the website from being iframed.
  setDefault(headers, "x-frame-options", "DENY");
  // Permission policy, disable features that we are not using to limit the attack surface.
  setDefault(
    headers,
    "permissions-policy",
    [
      "accelerometer=()",
      "camera=()",
      "cross-origin-isolated=()",
      "display-capture=()",
      "geolocation=()",
      "gyroscope=()",
      "keyboard-map=()",
      "magnetometer=()",
      "microphone=()",
      "payment=()",
      "publickey-credentials-get=()",
      "usb=()",
      "xr-spatial-tracking=()",
      "clipboard-read=(self)",
      "clipboard-write=(self)",
      "hid=()",
      "idle-detection=()",
      "unload=()",
    ].join(", ")
  );

  // Content Security Policy
  setDefault(headers, "content-security-policy", cspDirectives);

  return response;
});

export default securityHeaders;

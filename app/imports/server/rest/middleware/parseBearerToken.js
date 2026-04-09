/**
 * Middleware to parse a bearer token from HTTP request headers or query params.
 * Replaces the `simple:rest-bearer-token-parser` Atmosphere package.
 *
 * Sets `req.authToken` to the parsed bearer token string, or null if not found.
 */
export default function parseBearerToken(req, res, next) {
  // Check Authorization header first
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) {
      req.authToken = match[1];
      next();
      return;
    }
  }

  // Fall back to query parameter
  if (req.query?.access_token) {
    req.authToken = req.query.access_token;
    next();
    return;
  }

  // No token found
  req.authToken = null;
  next();
}

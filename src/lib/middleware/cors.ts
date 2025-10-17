// CORS middleware
export function corsHeaders(origin: string | null): HeadersInit {
  const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').filter(Boolean);

  // If no origin restrictions set, allow current origin
  if (allowedOrigins.length === 0 && origin) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };
  }

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };
  }

  return {};
}

/**
 * Handle preflight OPTIONS request
 */
export function handleCorsPrelight(origin: string | null): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

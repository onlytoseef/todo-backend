type OriginCallback = (error: Error | null, allow?: boolean) => void;

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, '');
}

export function getCorsOptions() {
  const defaults = ['http://localhost:3000'];
  const configured = (process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const allowedOrigins = new Set(
    [...defaults, ...configured].map((origin) => normalizeOrigin(origin)),
  );

  return {
    origin: (origin: string | undefined, callback: OriginCallback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalized = normalizeOrigin(origin);
      if (allowedOrigins.has(normalized)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}

const { sql } = require('@vercel/postgres');

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function configured() {
  return Boolean(process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL);
}

function keyOf(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 32);
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  if (!configured()) return json(res, 503, { ok:false, code:'SYNC_DATABASE_NOT_CONFIGURED' });
  try {
    await sql`CREATE TABLE IF NOT EXISTS backwoods_sync (sync_key TEXT PRIMARY KEY, data JSONB NOT NULL, updated_at BIGINT NOT NULL)`;
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const syncKey = keyOf(body.syncKey || req.query?.syncKey);
    if (!syncKey || syncKey.length < 8) return json(res, 400, { ok:false, code:'INVALID_SYNC_KEY' });

    if (req.method === 'GET') {
      const result = await sql`SELECT data, updated_at FROM backwoods_sync WHERE sync_key=${syncKey} LIMIT 1`;
      if (!result.rows.length) return json(res, 404, { ok:false, code:'SYNC_NOT_FOUND' });
      return json(res, 200, { ok:true, data:result.rows[0].data, updatedAt:Number(result.rows[0].updated_at) });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      if (!body.data || typeof body.data !== 'object') return json(res, 400, { ok:false, code:'INVALID_DATA' });
      const updatedAt = Number(body.updatedAt || Date.now());
      const result = await sql`
        INSERT INTO backwoods_sync (sync_key, data, updated_at)
        VALUES (${syncKey}, ${JSON.stringify(body.data)}::jsonb, ${updatedAt})
        ON CONFLICT (sync_key) DO UPDATE SET
          data=EXCLUDED.data,
          updated_at=EXCLUDED.updated_at
        WHERE backwoods_sync.updated_at <= EXCLUDED.updated_at
        RETURNING updated_at
      `;
      return json(res, 200, { ok:true, updatedAt:Number(result.rows[0]?.updated_at || updatedAt) });
    }

    return json(res, 405, { ok:false, code:'METHOD_NOT_ALLOWED' });
  } catch (error) {
    console.error('Backwoods sync error', error);
    return json(res, 500, { ok:false, code:'SYNC_SERVER_ERROR' });
  }
};

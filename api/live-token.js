const { sql } = require('@vercel/postgres');

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  if (req.method !== 'POST') return json(res, 405, { ok:false, code:'METHOD_NOT_ALLOWED' });
  if (!process.env.POSTGRES_URL && !process.env.POSTGRES_URL_NON_POOLING && !process.env.DATABASE_URL) {
    return json(res, 503, { ok:false, code:'DATABASE_NOT_CONFIGURED' });
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const deviceId = String(body.deviceId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
    const pushToken = String(body.pushToken || '').trim().replace(/[^a-zA-Z0-9+/=_-]/g, '').slice(0, 512);
    const leagueId = String(body.leagueId || '').replace(/\D/g, '').slice(0, 20);
    const season = Number(String(body.season || '2026').replace(/\D/g, '').slice(0,4) || 2026);
    const slot = Math.max(1, Math.min(12, Number(body.slot || 1)));
    if (!deviceId || !pushToken || !leagueId) return json(res, 400, { ok:false, code:'DEVICE_TOKEN_LEAGUE_REQUIRED' });

    await sql`CREATE TABLE IF NOT EXISTS bloss_live_devices (
      device_id TEXT PRIMARY KEY,
      push_token TEXT NOT NULL,
      league_id TEXT NOT NULL,
      season INTEGER NOT NULL,
      draft_slot INTEGER NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at BIGINT NOT NULL
    )`;

    await sql`
      INSERT INTO bloss_live_devices (device_id,push_token,league_id,season,draft_slot,active,updated_at)
      VALUES (${deviceId},${pushToken},${leagueId},${season},${slot},TRUE,${Date.now()})
      ON CONFLICT (device_id) DO UPDATE SET
        push_token=EXCLUDED.push_token,
        league_id=EXCLUDED.league_id,
        season=EXCLUDED.season,
        draft_slot=EXCLUDED.draft_slot,
        active=TRUE,
        updated_at=EXCLUDED.updated_at
    `;
    return json(res, 200, { ok:true });
  } catch (error) {
    console.error('Live token registration error', error);
    return json(res, 500, { ok:false, code:'LIVE_TOKEN_SERVER_ERROR' });
  }
};

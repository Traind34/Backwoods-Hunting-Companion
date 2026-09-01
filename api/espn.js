const ESPN_BASE = 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(body));
}

function clean(v) { return String(v || '').trim(); }

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  if (req.method !== 'GET') return json(res, 405, { ok:false, code:'METHOD_NOT_ALLOWED' });

  const q = req.query || {};
  const leagueId = clean(q.leagueId).replace(/\D/g, '');
  const season = clean(q.season || '2026').replace(/\D/g, '').slice(0,4) || '2026';
  if (!leagueId) return json(res, 400, { ok:false, code:'LEAGUE_ID_REQUIRED' });

  const url = `${ESPN_BASE}/${season}/segments/0/leagues/${leagueId}?view=mDraftDetail&view=mSettings&view=mTeam&view=mRoster&view=mNav`;
  const headers = { Accept:'application/json', 'User-Agent':'Backwoods-Bloss-Brusier-Draft-Assistant/1.0' };
  const cookies = [];
  if (process.env.ESPN_S2) cookies.push(`espn_s2=${process.env.ESPN_S2}`);
  if (process.env.ESPN_SWID) cookies.push(`SWID=${process.env.ESPN_SWID}`);
  if (cookies.length) headers.Cookie = cookies.join('; ');

  try {
    const r = await fetch(url, { headers, cache:'no-store' });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = null; }
    if (r.status === 401 || r.status === 403 || (data && data.messages)) {
      return json(res, 401, { ok:false, code:'ESPN_AUTH_REQUIRED', message:'This league is private. The server needs ESPN authentication configured in Vercel environment variables; never paste ESPN cookies into this chat.' });
    }
    if (!r.ok || !data) return json(res, r.status || 502, { ok:false, code:'ESPN_FETCH_FAILED', status:r.status });

    const picks = data.draftDetail?.picks || [];
    const teams = (data.teams || []).map(t => ({ id:t.id, name:t.name || t.location || `Team ${t.id}` }));
    const teamMap = Object.fromEntries(teams.map(t => [t.id, t.name]));
    return json(res, 200, {
      ok:true,
      season:Number(season),
      leagueId,
      inProgress:Boolean(data.draftDetail?.inProgress),
      drafted:Boolean(data.draftDetail?.drafted),
      picks:picks.map(p => ({ id:p.id, playerId:p.playerId, teamId:p.teamId, teamName:teamMap[p.teamId] || `Team ${p.teamId}`, overallPickNumber:p.overallPickNumber, roundId:p.roundId, roundPickNumber:p.roundPickNumber, autoDraftTypeId:p.autoDraftTypeId || 0 })),
      settings:data.settings || null,
      teams
    });
  } catch (e) {
    console.error('ESPN sync error', e);
    return json(res, 502, { ok:false, code:'ESPN_NETWORK_ERROR' });
  }
};

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xqkjzitsvtpnxmotklpx.supabase.co',
  'sb_publishable_7TzWq006BRE4HM68YaKeNA_ZKSIxaOW',
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);

export function cleanName(value) {
  const cleaned = String(value || '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, 16);
  return cleaned || 'SkyRider';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
  }[c]));
}

export async function fetchLeaderboard(limit = 5) {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('player_name,score,distance,wave')
    .order('score', { ascending: false })
    .order('distance', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function loadLeaderboard(listEl, statusEl) {
  statusEl.textContent = 'Loading…';

  let data;
  try {
    data = await fetchLeaderboard(5);
  } catch {
    statusEl.textContent = 'Offline';
    listEl.innerHTML = '<li>Leaderboard unavailable right now.</li>';
    return;
  }

  statusEl.textContent = data.length ? 'Live' : 'Be first';
  listEl.innerHTML = data.length
    ? data.map(row =>
        `<li>${escapeHtml(row.player_name)} <small>W${row.wave} · ${row.distance}m</small><span>${row.score}</span></li>`
      ).join('')
    : '<li>No scores yet. Suspiciously peaceful.</li>';
}

export async function submitScore({ playerName, score, distance, wave }) {
  if (score <= 0) return false;

  const { error } = await supabase.from('leaderboard').insert({
    player_name: cleanName(playerName),
    score: Math.max(0, Math.floor(score)),
    distance: Math.max(0, Math.floor(distance)),
    wave: Math.max(1, Math.floor(wave))
  });

  return !error;
}

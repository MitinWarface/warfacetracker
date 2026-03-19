const achMap = require('./src/lib/achievement-names.json');

function lookupAch(id) {
  const stripped = id.replace(/_name$/i, '');
  if (achMap[stripped]) return { key: stripped };
  const r = stripped.match(/^(.+?)_(badge|mark|stripe)_(\d+)$/);
  if (r) { const k = r[1] + '_' + r[3] + '_' + r[2]; if (achMap[k]) return { key: k }; }
  const parts = stripped.split('_');
  for (let i = 1; i < parts.length; i++) {
    const alt = parts.slice(i).concat(parts.slice(0, i)).join('_');
    if (achMap[alt]) return { key: alt };
  }
  for (let j = 0; j < parts.length - 1; j++) {
    const sw = [...parts]; [sw[j], sw[j + 1]] = [sw[j + 1], sw[j]];
    const k2 = sw.join('_'); if (achMap[k2]) return { key: k2 };
  }
  return null;
}

fetch('https://api.warface.ru/user/achievements/?name=%D0%98%D0%BD%D0%B8%D1%86%D0%B8%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD', { headers: { 'User-Agent': 'Mozilla/5.0' } })
  .then(r => r.json()).then(data => {
    const completed = data.filter(a => a.completion_time);
    const other = completed.filter(a => {
      const id = a.achievement_id;
      return !id.endsWith('_badge_name') && !id.endsWith('_mark_name') && !id.endsWith('_stripe_name');
    });
    let found = 0;
    const notFound = [];
    for (const a of other) {
      const res = lookupAch(a.achievement_id);
      if (res) found++;
      else notFound.push(a.achievement_id);
    }
    console.log('Total other:', other.length, 'Resolved:', found, 'Still missing:', notFound.length);
    console.log('Sample missing:', notFound.slice(0, 40));
  }).catch(e => console.error(e.message));

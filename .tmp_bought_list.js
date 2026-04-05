const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

function readEnv(path) {
  const env = {};
  const text = fs.readFileSync(path, 'utf8');
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[k] = v;
  }
  return env;
}

(async () => {
  try {
    console.log('Starting purchase lookup...');
    const env = readEnv('.env.local');
    const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.error('Missing Supabase credentials.');
      process.exit(1);
    }

    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

    const { data: enrollments, error: e1 } = await supabase.from('enrollments').select('user_id,course_id,payment_status,enrolled_at').eq('payment_status', 'completed');
    if (e1) throw new Error(`enrollments: ${e1.message}`);

    const { data: courses, error: e2 } = await supabase.from('courses').select('id,title,type');
    if (e2) throw new Error(`courses: ${e2.message}`);

    const { data: profiles, error: e3 } = await supabase.from('profiles').select('id,first_name,last_name,email');
    if (e3) throw new Error(`profiles: ${e3.message}`);

    const courseById = new Map((courses || []).map(c => [c.id, c]));
    const profileById = new Map((profiles || []).map(p => [p.id, p]));

    const rows = (enrollments || [])
      .filter(r => courseById.get(r.course_id)?.type === 'paid')
      .map(r => {
        const p = profileById.get(r.user_id) || {};
        const c = courseById.get(r.course_id) || {};
        return {
          name: [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'N/A',
          email: p.email || 'N/A',
          course: c.title || r.course_id,
          enrolled_at: r.enrolled_at,
        };
      })
      .sort((a, b) => new Date(b.enrolled_at) - new Date(a.enrolled_at));

    console.log(`PAID COURSE PURCHASES (completed): ${rows.length}`);
    rows.forEach(r => console.log(`${r.name} | ${r.email} | ${r.course} | ${r.enrolled_at}`));
    console.log('Done.');
  } catch (err) {
    console.error('FAILED:', err.message || err);
    process.exit(1);
  }
})();

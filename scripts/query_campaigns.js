const fs = require('fs');
const path = require('path');
(async () => {
  try {
    const envText = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
    const lines = envText.split(/\r?\n/);
    const env = {};
    for (const l of lines) {
      const m = l.match(/^([^=]+)=(.*)$/);
      if (m) env[m[1]] = m[2];
    }
    const SUPA_URL = env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPA_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!SUPA_URL || !SUPA_KEY) {
      console.error('Missing supabase env in .env.local');
      process.exit(1);
    }
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPA_URL, SUPA_KEY);
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) {
      console.error('Supabase query error:', error);
      process.exit(1);
    }
    console.log('Recent campaigns:');
    console.log(data);
  } catch (err) {
    console.error('Script error:', err);
    process.exit(1);
  }
})();
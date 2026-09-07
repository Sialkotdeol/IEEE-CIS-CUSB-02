import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function run() {
  const res = await fetch("http://localhost:3000/api/code-warriors/sync?userId=usr-mhql2ikdo");
  const data = await res.json();
  console.log(data);
}
run();

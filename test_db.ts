import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function run() {
  const { data, error } = await supabase.from("code_warriors_submissions")
    .select("*, profile:user_id(name, leetcode_handle)")
    .eq("is_potd", true)
    .order("creation_time", { ascending: false })
    .limit(10);
  console.log(data);
}
run();

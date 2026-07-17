import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function test() {
  const { data, error } = await supabase
    .from('doubts')
    .select(`
      id, title, status, created_at, subject,
      profiles:user_id ( first_name, last_name )
    `)
  console.log("Error:", error)
  console.log("Data:", data)
}

test()

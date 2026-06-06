/**
 * Fetch all emails from Supabase profiles table.
 *
 * Run:
 *   npx tsx scripts/fetch-emails.ts
 *   npx tsx scripts/fetch-emails.ts --role student
 *   npx tsx scripts/fetch-emails.ts --role student --csv
 */

import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role — bypasses RLS
)

async function main() {
  const args = process.argv.slice(2)
  const roleFlag = args.indexOf("--role")
  const filterRole = roleFlag !== -1 ? args[roleFlag + 1] : null
  const exportCsv = args.includes("--csv")

  console.log("Fetching profiles from Supabase...")

  let query = supabase
    .from("profiles")
    .select("id, email, first_name, last_name, role")
    .not("email", "is", null)
    .neq("email", "")

  if (filterRole) {
    query = query.eq("role", filterRole)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching profiles:", error.message)
    process.exit(1)
  }

  const profiles = data ?? []

  // Summary
  const roleCounts: Record<string, number> = {}
  profiles.forEach((p) => {
    roleCounts[p.role ?? "unknown"] = (roleCounts[p.role ?? "unknown"] ?? 0) + 1
  })

  console.log(`\nTotal profiles fetched: ${profiles.length}`)
  console.log("Breakdown by role:")
  Object.entries(roleCounts).forEach(([role, count]) => {
    console.log(`  ${role}: ${count}`)
  })

  // Print email list
  console.log("\nEmails:")
  profiles.forEach((p, i) => {
    const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || "—"
    console.log(`  ${String(i + 1).padStart(3)}. ${p.email}  (${name} / ${p.role})`)
  })

  // CSV export
  if (exportCsv) {
    const rows = ["email,first_name,last_name,role"]
    profiles.forEach((p) => {
      rows.push(`${p.email},${p.first_name ?? ""},${p.last_name ?? ""},${p.role ?? ""}`)
    })
    const filename = filterRole ? `emails-${filterRole}.csv` : "emails-all.csv"
    fs.writeFileSync(filename, rows.join("\n"))
    console.log(`\nExported to ${filename}`)
  }
}

main()

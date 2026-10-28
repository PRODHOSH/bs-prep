import { LegalPage } from "@/components/legal-page"

const sections = [
  {
    title: "What are cookies",
    body: "Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences, keep you logged in, and understand how you use the platform. BSPrep uses a minimal set of cookies strictly necessary for functionality and anonymous analytics.",
  },
  {
    title: "Essential cookies",
    body: "These cookies are required for the platform to function. They manage your login session via Supabase authentication — without them, you cannot stay signed in. These cookies are always active and cannot be disabled without breaking core platform functionality.",
  },
  {
    title: "Analytics cookies",
    body: "We use Google Analytics 4 (ID: G-06EFDQ4LSM) to understand how visitors interact with BSPrep — which pages are most visited, how long sessions last, and where users come from. This data is aggregated and anonymised. No personally identifiable information is shared with Google through this integration.",
  },
  {
    title: "Performance cookies",
    body: "Vercel Analytics collects anonymous page load performance data to help us improve site speed and reliability. This data contains no personally identifiable information and is used solely for technical optimisation.",
  },
  {
    title: "Search & webmaster tools",
    body: "Google Search Console and Bing Webmaster Tools are used to monitor how BSPrep appears in search engine results. These are site-level tools and do not place tracking cookies on your device or collect personal user data.",
  },
  {
    title: "No advertising cookies",
    body: "BSPrep does not use advertising networks, retargeting pixels, or third-party marketing cookies. We do not track you for ad targeting purposes, and we do not sell or share your browsing data with advertisers.",
  },
  {
    title: "Cookie duration",
    body: "Session cookies expire when you close your browser. Persistent cookies (such as authentication tokens) may last up to 7 days or until you sign out. Analytics cookies set by Google Analytics may persist for up to 2 years in accordance with their default configuration.",
  },
  {
    title: "Managing your cookies",
    body: "You can manage or disable cookies through your browser settings at any time. Most browsers allow you to block or delete cookies. Note that disabling essential cookies will prevent you from staying logged in to BSPrep. Disabling analytics cookies will not affect your ability to use the platform.",
  },
  {
    title: "Your consent",
    body: "When you first visit BSPrep, a cookie consent banner is displayed at the bottom of the page. You can accept all cookies or dismiss the banner. Accepting analytics cookies helps us improve the platform. You may withdraw consent for analytics cookies at any time by adjusting your browser settings or using your browser's built-in privacy controls.",
  },
  {
    title: "Policy updates",
    body: "We may update this Cookie Policy as our platform or third-party tools evolve. Changes will be posted on this page with a revised date. We recommend reviewing this page periodically to stay informed.",
  },
]

const cookieTable = [
  { name: "sb-access-token", provider: "Supabase", type: "Essential", purpose: "Maintains your authenticated login session", duration: "Session / 7 days" },
  { name: "sb-refresh-token", provider: "Supabase", type: "Essential", purpose: "Refreshes your session without re-login", duration: "7 days" },
  { name: "_ga", provider: "Google Analytics", type: "Analytics", purpose: "Distinguishes unique visitors (anonymised)", duration: "2 years" },
  { name: "_ga_*", provider: "Google Analytics 4", type: "Analytics", purpose: "Persists GA4 session state", duration: "2 years" },
  { name: "va_*", provider: "Vercel Analytics", type: "Performance", purpose: "Anonymous page performance tracking", duration: "Session" },
]

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie policy" sections={sections} contact={{ heading: "Questions about cookies?", email: "support@bsprep.in" }}>
          {/* Cookie table */}
          <div className="mt-8">
            <p className="text-xs uppercase tracking-widest text-black/40 font-medium mb-3">Cookies in Use</p>
            <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/6">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-black/50 uppercase tracking-wider">Name</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-black/50 uppercase tracking-wider">Provider</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-black/50 uppercase tracking-wider">Type</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-black/50 uppercase tracking-wider hidden md:table-cell">Purpose</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-black/50 uppercase tracking-wider">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cookieTable.map((row, i) => (
                      <tr key={row.name} className={i !== cookieTable.length - 1 ? "border-b border-black/6" : ""}>
                        <td className="px-5 py-3.5 font-mono text-xs text-black/70">{row.name}</td>
                        <td className="px-5 py-3.5 text-xs text-black/60">{row.provider}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            row.type === "Essential"
                              ? "bg-black/5 text-black/70"
                              : row.type === "Analytics"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-green-50 text-green-700"
                          }`}>
                            {row.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-black/50 hidden md:table-cell">{row.purpose}</td>
                        <td className="px-5 py-3.5 text-xs text-black/60 whitespace-nowrap">{row.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
    </LegalPage>
  )
}

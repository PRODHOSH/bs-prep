/** Where to go after signing in: back to the page the visitor came from, never the home page or an auth page. */
export function safeNext(n: string | null | undefined): string {
  return n && n.startsWith("/") && !n.startsWith("//") && n !== "/" && !n.startsWith("/auth") ? n : "/dashboard"
}

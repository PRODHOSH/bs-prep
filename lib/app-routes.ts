/** Routes rendered inside the student, mentor and admin dashboards (not the public website). */
export const isAppRoute = (pathname: string | null | undefined) => /^\/(dashboard|admin|mentor)(\/|$)/.test(pathname ?? "")

/** Pages that bring their own full-screen UI: no site splash, animated backdrop or loading overlay. */
export const isChromeFree = (pathname: string | null | undefined) => isAppRoute(pathname) || /^\/compiler(\/|$)/.test(pathname ?? "")

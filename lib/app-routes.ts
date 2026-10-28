/** Routes rendered inside the student, mentor and admin dashboards (not the public website). */
export const isAppRoute = (pathname: string | null | undefined) => /^\/(dashboard|admin|mentor)(\/|$)/.test(pathname ?? "")

import { Manrope } from "next/font/google"

// Dashboard-only font. Loaded (and preloaded) just for routes that import this module, so the public site is unaffected.
export const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" })

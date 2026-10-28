import { JetBrains_Mono } from "next/font/google"

// Code font for the compiler pages only (loaded just where this module is imported).
export const codeFont = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code", display: "swap" })

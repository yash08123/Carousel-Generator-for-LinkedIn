"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Define a very simple props type with only the essential properties
interface ThemeProviderProps {
  children: React.ReactNode
  [key: string]: any  // Allow any additional properties
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
} 
"use client"

import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

interface ThemeToggleProps {
  isCollapsed?: boolean
  className?: string
}

export function ThemeToggle({ isCollapsed = false, className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-9 w-full" />
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`flex items-center gap-x-3 w-full rounded-md px-2.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50 transition-colors cursor-pointer ${className}`}
      title={isDark ? "Ubah ke Mode Terang (Light Mode)" : "Ubah ke Mode Gelap (Dark Mode)"}
    >
      {isDark ? (
        <Sun className="size-4 shrink-0 text-amber-500" />
      ) : (
        <Moon className="size-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
      )}
      {!isCollapsed && (
        <span>{isDark ? "Mode Terang" : "Mode Gelap"}</span>
      )}
    </button>
  )
}

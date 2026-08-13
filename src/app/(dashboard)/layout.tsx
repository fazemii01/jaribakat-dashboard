"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cx } from "@/lib/utils"
import { Sidebar } from "@/components/ui/navigation/Sidebar"
import MobileSidebar from "@/components/ui/navigation/MobileSidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { getAuthToken, fetchApi, removeAuthToken } from "@/lib/api"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  useEffect(() => {
    async function verifyAdminAccess() {
      const token = getAuthToken()
      if (!token) {
        setIsAuthChecked(true)
        setIsAuthorized(false)
        router.replace("/login")
        return
      }

      try {
        const profile = await fetchApi("/auth/profile")
        if (profile && profile.role === "admin") {
          setIsAuthorized(true)
        } else {
          removeAuthToken()
          setIsAuthorized(false)
          router.replace("/login")
        }
      } catch (err) {
        removeAuthToken()
        setIsAuthorized(false)
        router.replace("/login")
      } finally {
        setIsAuthChecked(true)
      }
    }

    verifyAdminAccess()
  }, [router])

  // Display security loading state while verifying admin authentication
  if (!isAuthChecked || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 font-sans p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white p-2 border border-gray-200 dark:border-gray-800 shadow-md flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/image.png"
              alt="JariBakat Mascot Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-[#1E1B4B] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-[#0F172A] dark:text-white">
              Memverifikasi Otentikasi Admin JariBakat...
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-screen-2xl min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Top Header Bar (< lg) */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-3 border-b border-gray-200 dark:bg-gray-925 dark:border-gray-900">
        <div className="flex items-center gap-3">
          <MobileSidebar />
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/image.png"
              alt="JariBakat Mascot Logo"
              className="w-7 h-7 object-contain"
            />
            <span className="font-bold text-gray-900 dark:text-gray-50 text-sm">
              JariBakat CMS
            </span>
          </div>
        </div>
        <div className="w-auto">
          <ThemeToggle isCollapsed={true} />
        </div>
      </header>

      {/* Desktop Sidebar (>= lg) */}
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <main
        className={cx(
          isCollapsed ? "lg:pl-[60px]" : "lg:pl-64",
          "ease transform-gpu transition-all duration-100 will-change-transform lg:bg-gray-50 lg:py-3 lg:pr-3 lg:dark:bg-gray-950 min-h-[calc(100vh-57px)] lg:min-h-screen",
        )}
      >
        <div className="bg-white p-4 sm:p-6 min-h-[calc(100vh-57px)] lg:min-h-[calc(100vh-24px)] lg:rounded-lg lg:border lg:border-gray-200 dark:bg-gray-925 lg:dark:border-gray-900">
          {children}
        </div>
      </main>
    </div>
  )
}

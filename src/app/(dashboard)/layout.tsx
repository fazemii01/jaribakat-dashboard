"use client"
import React from "react"
import { cx } from "@/lib/utils"
import { Sidebar } from "@/components/ui/navigation/Sidebar"
import MobileSidebar from "@/components/ui/navigation/MobileSidebar"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="mx-auto max-w-screen-2xl min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Top Header Bar (< lg) */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-3 border-b border-gray-200 dark:bg-gray-925 dark:border-gray-900">
        <div className="flex items-center gap-3">
          <MobileSidebar />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              JB
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-50 text-sm">
              JariBakat CMS
            </span>
          </div>
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

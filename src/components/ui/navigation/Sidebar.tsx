"use client"

import { siteConfig } from "@/app/siteConfig"
import { cx, focusRing } from "@/lib/utils"
import { removeAuthToken } from "@/lib/api"
import { ThemeToggle } from "@/components/ThemeToggle"
import {
  BarChartBig,
  Image as ImageIcon,
  Package,
  Ticket,
  Tag,
  Video,
  HelpCircle,
  Users,
  Sparkles,
  ShieldCheck,
  LayoutGrid,
  FileText,
  Settings,
  PanelRightClose,
  PanelRightOpen,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import React from "react"

const navigation = [
  { name: "Overview", href: siteConfig.baseLinks.overview, icon: BarChartBig },
  { name: "Banner Hero", href: siteConfig.baseLinks.banners, icon: ImageIcon },
  { name: "Program Layanan", href: siteConfig.baseLinks.programs, icon: Package },
  { name: "Event & Paket", href: siteConfig.baseLinks.events, icon: Ticket },
  { name: "Topik & Category", href: siteConfig.baseLinks.topics, icon: Tag },
  { name: "Video Courses", href: siteConfig.baseLinks.videoCourses, icon: Video },
  { name: "FAQ", href: siteConfig.baseLinks.faqs, icon: HelpCircle },
  { name: "Komunitas", href: siteConfig.baseLinks.communities, icon: Users },
  { name: "Fitur & Keunggulan", href: siteConfig.baseLinks.features, icon: Sparkles },
  { name: "Kelola Admin / User", href: siteConfig.baseLinks.users, icon: ShieldCheck },
  { name: "Footer Links", href: siteConfig.baseLinks.footer, icon: LayoutGrid },
  { name: "Halaman Statis", href: siteConfig.baseLinks.pages, icon: FileText },
  { name: "Pengaturan Situs", href: siteConfig.baseLinks.siteSettings, icon: Settings },
] as const

interface SidebarProps {
  isCollapsed: boolean
  toggleSidebar: () => void
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (itemHref: string) => {
    if (itemHref === "/") return pathname === "/"
    return pathname.startsWith(itemHref)
  }

  const handleLogout = () => {
    removeAuthToken()
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
    }
    router.replace("/login")
  }

  return (
    <aside
      className={cx(
        isCollapsed ? "lg:w-[60px]" : "lg:w-64",
        "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col ease transform-gpu transition-all duration-100 will-change-transform",
      )}
    >
      <div className="flex h-full flex-col justify-between bg-white px-3 py-4 border-r border-gray-200 dark:bg-gray-925 dark:border-gray-900">
        <div>
          <div className="flex items-center justify-between px-2 pb-4 border-b border-gray-100 dark:border-gray-800">
            {!isCollapsed ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 p-1 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/image.png"
                    alt="JariBakat Mascot Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-bold text-gray-900 dark:text-gray-50 text-sm tracking-tight">
                  JariBakat CMS
                </span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 p-1 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 shrink-0 mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/image.png"
                  alt="JariBakat Mascot Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              {isCollapsed ? (
                <PanelRightOpen className="size-5" />
              ) : (
                <PanelRightClose className="size-5" />
              )}
            </button>
          </div>

          <nav className="mt-4 space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cx(
                    active
                      ? "bg-blue-50 text-[#1E1B4B] dark:bg-blue-950/50 dark:text-blue-400 font-semibold"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 hover:dark:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-50 font-medium",
                    "flex items-center gap-x-3 rounded-md px-2.5 py-2 text-xs transition-colors",
                    focusRing,
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className="size-4 shrink-0" aria-hidden="true" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Theme Toggle & Logout Section */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <ThemeToggle isCollapsed={isCollapsed} />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-x-3 rounded-md px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            title={isCollapsed ? "Keluar Akun" : undefined}
          >
            <LogOut className="size-4 shrink-0 text-red-600" />
            {!isCollapsed && <span>Keluar Admin</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}

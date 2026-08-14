"use client"

import { siteConfig } from "@/app/siteConfig"
import { Button } from "@/components/Button"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/Drawer"
import { cx, focusRing } from "@/lib/utils"
import { removeAuthToken } from "@/lib/api"
import { useRouter } from "next/navigation"
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
  Menu,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { name: "Overview", href: siteConfig.baseLinks.overview, icon: BarChartBig },
  { name: "Banner Hero", href: siteConfig.baseLinks.banners, icon: ImageIcon },
  { name: "Program Layanan", href: siteConfig.baseLinks.programs, icon: Package },
  { name: "Event & Paket", href: siteConfig.baseLinks.events, icon: Ticket },
  { name: "Topik & Category", href: siteConfig.baseLinks.topics, icon: Tag },
  { name: "Video Courses", href: siteConfig.baseLinks.videoCourses, icon: Video },
  { name: "Video Testimoni", href: siteConfig.baseLinks.testimonials, icon: Video },
  { name: "FAQ", href: siteConfig.baseLinks.faqs, icon: HelpCircle },
  { name: "Komunitas", href: siteConfig.baseLinks.communities, icon: Users },
  { name: "Fitur & Keunggulan", href: siteConfig.baseLinks.features, icon: Sparkles },
  { name: "Kelola Admin / User", href: siteConfig.baseLinks.users, icon: ShieldCheck },
  { name: "Footer Links", href: siteConfig.baseLinks.footer, icon: LayoutGrid },
  { name: "Halaman Statis", href: siteConfig.baseLinks.pages, icon: FileText },
  { name: "Pengaturan Situs", href: siteConfig.baseLinks.siteSettings, icon: Settings },
] as const

export default function MobileSidebar() {
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
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            aria-label="open sidebar"
            className="group flex items-center rounded-md p-1.5 text-sm font-medium hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[state=open]:bg-gray-400/10 hover:dark:bg-gray-400/10"
          >
            <Menu className="size-6 shrink-0 text-gray-600 dark:text-gray-400" aria-hidden="true" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/image.png"
                alt="JariBakat Mascot Logo"
                className="w-6 h-6 object-contain"
              />
              <span>JariBakat CMS</span>
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <nav
              aria-label="core mobile navigation links"
              className="flex flex-1 flex-col space-y-8"
            >
              <div>
                <span
                  className={cx(
                    "block h-6 text-xs font-medium leading-6 text-gray-500 transition-opacity dark:text-gray-400",
                  )}
                >
                  Platform CMS
                </span>
                <ul role="list" className="mt-1 space-y-1.5">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <DrawerClose asChild>
                        <Link
                          href={item.href}
                          className={cx(
                            isActive(item.href)
                              ? "text-[#1E1B4B] dark:text-blue-500 font-semibold"
                              : "text-gray-600 hover:text-[#0F172A] dark:text-gray-400 hover:dark:text-gray-50",
                            "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-base font-medium transition hover:bg-gray-100 sm:text-sm hover:dark:bg-gray-900",
                            focusRing,
                          )}
                        >
                          <item.icon
                            className="size-5 shrink-0"
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </DrawerClose>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <ThemeToggle />
                <DrawerClose asChild>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-x-2.5 rounded-md px-2 py-2 text-base font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut className="size-5 shrink-0 text-red-600" />
                    <span>Keluar Admin</span>
                  </button>
                </DrawerClose>
              </div>
            </nav>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

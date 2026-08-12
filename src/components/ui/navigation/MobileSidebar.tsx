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
  LayoutGrid,
  FileText,
  Settings,
  Menu,
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
  { name: "FAQ", href: siteConfig.baseLinks.faqs, icon: HelpCircle },
  { name: "Komunitas", href: siteConfig.baseLinks.communities, icon: Users },
  { name: "Keunggulan (USP)", href: siteConfig.baseLinks.usps, icon: Sparkles },
  { name: "Footer Links", href: siteConfig.baseLinks.footer, icon: LayoutGrid },
  { name: "Halaman Statis", href: siteConfig.baseLinks.pages, icon: FileText },
  { name: "Pengaturan Situs", href: siteConfig.baseLinks.siteSettings, icon: Settings },
] as const

export default function MobileSidebar() {
  const pathname = usePathname()
  const isActive = (itemHref: string) => {
    if (itemHref === "/") return pathname === "/"
    return pathname.startsWith(itemHref)
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
            <DrawerTitle>JariBakat CMS</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <nav
              aria-label="core mobile navigation links"
              className="flex flex-1 flex-col space-y-10"
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
                              ? "text-blue-600 dark:text-blue-500 font-semibold"
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
            </nav>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

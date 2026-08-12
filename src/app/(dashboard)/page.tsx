"use client"

import { Card } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { BarChartBig, Image as ImageIcon, Package, Ticket, Tag, Video, HelpCircle, Users, Sparkles, LayoutGrid, FileText, Settings, ArrowRight } from "lucide-react"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { fetchApi } from "@/lib/api"

export default function CMSOverviewPage() {
  const [stats, setStats] = useState({
    banners: 0,
    programs: 0,
    events: 0,
    topics: 0,
    videos: 0,
    faqs: 0,
    communities: 0,
    usps: 0,
    footer: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [banners, programs, events, topics, videos, faqs, communities, usps, footer] = await Promise.all([
          fetchApi("/banners").catch(() => []),
          fetchApi("/programs").catch(() => []),
          fetchApi("/events").catch(() => []),
          fetchApi("/topics").catch(() => []),
          fetchApi("/video-courses").catch(() => []),
          fetchApi("/faqs").catch(() => []),
          fetchApi("/communities").catch(() => []),
          fetchApi("/usps").catch(() => []),
          fetchApi("/footer").catch(() => []),
        ])

        setStats({
          banners: Array.isArray(banners) ? banners.length : 0,
          programs: Array.isArray(programs) ? programs.length : 0,
          events: Array.isArray(events) ? events.length : 0,
          topics: Array.isArray(topics) ? topics.length : 0,
          videos: Array.isArray(videos) ? videos.length : 0,
          faqs: Array.isArray(faqs) ? faqs.length : 0,
          communities: Array.isArray(communities) ? communities.length : 0,
          usps: Array.isArray(usps) ? usps.length : 0,
          footer: Array.isArray(footer) ? footer.length : 0,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const cmsSections = [
    { title: "Banner Hero", count: stats.banners, href: "/banners", icon: ImageIcon, color: "text-blue-500", desc: "Kelola gambar slide carousel hero" },
    { title: "Program Layanan", count: stats.programs, href: "/programs", icon: Package, color: "text-emerald-500", desc: "Kelola paket online, offline & expert" },
    { title: "Event & Paket Catalog", count: stats.events, href: "/events", icon: Ticket, color: "text-purple-500", desc: "Katalog tes bakat & event kalender" },
    { title: "Topik & Kategori", count: stats.topics, href: "/topics", icon: Tag, color: "text-amber-500", desc: "Topik kecemasan, gaya belajar, karir" },
    { title: "Video Courses", count: stats.videos, href: "/video-courses", icon: Video, color: "text-rose-500", desc: "Video pembelajaran & rekaman webinar" },
    { title: "FAQ Pusat Bantuan", count: stats.faqs, href: "/faqs", icon: HelpCircle, color: "text-cyan-500", desc: "Pertanyaan dan jawaban populer" },
    { title: "Komunitas", count: stats.communities, href: "/communities", icon: Users, color: "text-indigo-500", desc: "Link grup WhatsApp komunitas" },
    { title: "Keunggulan (USP)", count: stats.usps, href: "/usps", icon: Sparkles, color: "text-amber-600", desc: "Nilai tambah & keunggulan tes bakat" },
    { title: "Footer Links", count: stats.footer, href: "/footer", icon: LayoutGrid, color: "text-[#1E1B4B]", desc: "Kolom dan menu tautan footer" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Content Management System Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kelola seluruh konten landing page JariBakat secara terpusat
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cmsSections.map((sec) => (
          <Card key={sec.title} className="flex flex-col justify-between p-5 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 ${sec.color}`}>
                  <sec.icon className="size-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-50 text-base">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {sec.desc}
                  </p>
                </div>
              </div>
              <Badge variant="neutral">
                {loading ? "..." : `${sec.count} items`}
              </Badge>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <Button asChild variant="secondary" className="text-xs gap-1.5 py-1.5 px-3">
                <Link href={sec.href}>
                  <span>Kelola Konten</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

"use client"

import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Button } from "@/components/Button"
import { Textarea } from "@/components/Textarea"
import { Megaphone, Phone, Search } from "lucide-react"
import React, { useEffect, useState } from "react"
import { fetchApi } from "@/lib/api"

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [settings, setSettings] = useState({
    running_text: "",
    running_text_highlight: "",
    running_text_suffix: "",
    running_text_cta_text: "",
    running_text_cta_href: "",
    whatsapp_number: "",
    whatsapp_floating_visible: "true",
    contact_email: "",
    copyright_text: "",
    site_title: "",
    site_description: "",
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await fetchApi("/site-settings")
        setSettings((prev) => ({ ...prev, ...data }))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      await fetchApi("/site-settings", {
        method: "PUT",
        body: JSON.stringify({ settings }),
      })
      setMessage("Pengaturan berhasil disimpan!")
    } catch (err: any) {
      setMessage(`Gagal menyimpan: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Memuat pengaturan...</div>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Pengaturan Situs (Site Settings)
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kelola Running Text Banner, kontak WhatsApp, footer & SEO metadata
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-semibold ${message.includes("Gagal") ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Running Text Banner Settings */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 border-b pb-2 border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Megaphone className="size-5 text-blue-500" />
            <span>Running Text Top Banner</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Teks Utama Banner</Label>
              <Input
                value={settings.running_text}
                onChange={(e) => handleChange("running_text", e.target.value)}
                placeholder="Tes Bakat & Fingerprint..."
              />
            </div>
            <div className="space-y-2">
              <Label>Teks Highlight (Bold/Warna)</Label>
              <Input
                value={settings.running_text_highlight}
                onChange={(e) => handleChange("running_text_highlight", e.target.value)}
                placeholder="Paket Hemat Rp350.000"
              />
            </div>
            <div className="space-y-2">
              <Label>Teks Suffix / Akhiran</Label>
              <Input
                value={settings.running_text_suffix}
                onChange={(e) => handleChange("running_text_suffix", e.target.value)}
                placeholder="• Temukan Potensi Sejak Dini"
              />
            </div>
            <div className="space-y-2">
              <Label>Tombol CTA Text</Label>
              <Input
                value={settings.running_text_cta_text}
                onChange={(e) => handleChange("running_text_cta_text", e.target.value)}
                placeholder="Pilih Paket Bakat"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Tombol CTA Href / URL Link</Label>
              <Input
                value={settings.running_text_cta_href}
                onChange={(e) => handleChange("running_text_cta_href", e.target.value)}
                placeholder="/event"
              />
            </div>
          </div>
        </Card>

        {/* WhatsApp & Contact Info */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 border-b pb-2 border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Phone className="size-5 text-emerald-500" />
            <span>Kontak & WhatsApp Floating</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nomor WhatsApp (format: 628xxx)</Label>
              <Input
                value={settings.whatsapp_number}
                onChange={(e) => handleChange("whatsapp_number", e.target.value)}
                placeholder="6285196235285"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Customer Support</Label>
              <Input
                value={settings.contact_email}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                placeholder="info@jaribakat.com"
              />
            </div>
          </div>
        </Card>

        {/* SEO & Footer */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 border-b pb-2 border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Search className="size-5 text-amber-500" />
            <span>SEO & Copyright Footer</span>
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Judul Situs (SEO Meta Title)</Label>
              <Input
                value={settings.site_title}
                onChange={(e) => handleChange("site_title", e.target.value)}
                placeholder="JariBakat - Tempat Bertumbuh..."
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Situs (SEO Meta Description)</Label>
              <Textarea
                value={settings.site_description}
                onChange={(e) => handleChange("site_description", e.target.value)}
                placeholder="Platform Terbaik No.1 Indonesia..."
              />
            </div>
            <div className="space-y-2">
              <Label>Teks Copyright Footer</Label>
              <Input
                value={settings.copyright_text}
                onChange={(e) => handleChange("copyright_text", e.target.value)}
                placeholder="© 2025 Jaribakat. All rights reserved."
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={saving} className="px-8">
            {saving ? "Memproses..." : "Simpan Semua Pengaturan"}
          </Button>
        </div>
      </form>
    </div>
  )
}

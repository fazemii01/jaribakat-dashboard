"use client"

import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Button } from "@/components/Button"
import { Textarea } from "@/components/Textarea"
import { Megaphone, Phone, Search, Palette, Eye, X } from "lucide-react"
import React, { useEffect, useState } from "react"
import { fetchApi } from "@/lib/api"

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const [settings, setSettings] = useState({
    running_text: "Tes Bakat & Fingerprint Analytics JariBakat",
    running_text_highlight: "Paket Hemat Rp350.000",
    running_text_suffix: " • Temukan Potensi Sejak Dini",
    running_text_cta_text: "Pilih Paket Bakat",
    running_text_cta_href: "/event",
    running_text_bg_color: "#0F172A",
    running_text_main_color: "#FFFFFF",
    running_text_highlight_color: "#0D9488",
    running_text_cta_color: "#F59E0B",
    running_text_visible: "true",

    whatsapp_number: "6285196235285",
    whatsapp_floating_visible: "true",
    contact_email: "info@jaribakat.com",
    copyright_text: "© 2025 Jaribakat. All rights reserved.",
    site_title: "JariBakat - Tempat Bertumbuh Bersama",
    site_description: "Platform Terbaik No.1 Indonesia untuk Tes Bakat & Sidik Jari Anak, Remaja, dan Keluarga.",
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
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
          Pengaturan Situs &amp; Top Running Banner
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Atur teks, warna highlight, warna tombol CTA, warna background, serta kontak &amp; SEO metadata situs
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-semibold ${message.includes("Gagal") ? "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Real-time Live Preview Card */}
        <Card className="p-5 space-y-4 border-2 border-indigo-200 dark:border-indigo-900 bg-gray-900 text-white overflow-hidden">
          <div className="flex items-center justify-between border-b pb-3 border-gray-800">
            <div className="flex items-center gap-2 font-bold text-sm text-indigo-400">
              <Eye className="size-4" />
              <span>Live Preview Banner Running Text (Real-time)</span>
            </div>
            <span className="text-xs text-gray-400 font-mono">Top Bar Banner</span>
          </div>

          {/* Interactive Live Banner Sandbox */}
          <div
            style={{ backgroundColor: settings.running_text_bg_color || "#0F172A" }}
            className="relative w-full rounded-xl p-4 md:p-5 flex items-center justify-between gap-4 border border-white/10 shadow-lg overflow-hidden transition-all duration-300"
          >
            {/* Decorative Corner Badges */}
            <div
              style={{ backgroundColor: settings.running_text_cta_color || "#F59E0B" }}
              className="absolute -top-6 -left-6 w-12 h-12 rounded-full pointer-events-none opacity-80"
            />
            <div
              style={{ backgroundColor: settings.running_text_cta_color || "#F59E0B" }}
              className="absolute -top-6 -right-6 w-12 h-12 rounded-full pointer-events-none opacity-80"
            />

            <div className="flex items-center gap-3 overflow-hidden flex-1">
              <div
                style={{ color: settings.running_text_main_color || "#FFFFFF" }}
                className="text-xs sm:text-sm font-bold flex items-center gap-2 truncate"
              >
                <span>{settings.running_text}</span>
                <span
                  style={{ color: settings.running_text_highlight_color || "#0D9488" }}
                  className="font-extrabold px-1.5 py-0.5 rounded bg-white/10"
                >
                  {settings.running_text_highlight}
                </span>
                <span>{settings.running_text_suffix}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                style={{
                  borderColor: settings.running_text_cta_color || "#F59E0B",
                  color: settings.running_text_cta_color || "#F59E0B",
                }}
                className="px-4 py-1.5 rounded-full text-xs font-bold border-2 whitespace-nowrap"
              >
                {settings.running_text_cta_text || "Pilih Paket Bakat"}
              </span>
              <X className="size-4 opacity-60" />
            </div>
          </div>
        </Card>

        {/* Top Running Banner Config */}
        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 border-b pb-3 border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Megaphone className="size-5 text-blue-500" />
            <span>Konten Teks Top Announcement Banner</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Teks Utama Banner</Label>
              <Input
                value={settings.running_text}
                onChange={(e) => handleChange("running_text", e.target.value)}
                placeholder="Tes Bakat &amp; Fingerprint Analytics JariBakat"
              />
            </div>

            <div className="space-y-2">
              <Label>Teks Highlight (Pesan Promo / Diskon)</Label>
              <Input
                value={settings.running_text_highlight}
                onChange={(e) => handleChange("running_text_highlight", e.target.value)}
                placeholder="Paket Hemat Rp350.000"
              />
            </div>

            <div className="space-y-2">
              <Label>Teks Suffix / Pesan Akhiran</Label>
              <Input
                value={settings.running_text_suffix}
                onChange={(e) => handleChange("running_text_suffix", e.target.value)}
                placeholder="• Temukan Potensi Sejak Dini"
              />
            </div>

            <div className="space-y-2">
              <Label>Label Tombol CTA</Label>
              <Input
                value={settings.running_text_cta_text}
                onChange={(e) => handleChange("running_text_cta_text", e.target.value)}
                placeholder="Pilih Paket Bakat"
              />
            </div>

            <div className="space-y-2">
              <Label>CTA Link Href / Action URL</Label>
              <Input
                value={settings.running_text_cta_href}
                onChange={(e) => handleChange("running_text_cta_href", e.target.value)}
                placeholder="/event"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Status Tampilan Top Banner</Label>
              <select
                value={settings.running_text_visible || "true"}
                onChange={(e) => handleChange("running_text_visible", e.target.value)}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
              >
                <option value="true">Aktif (Tampilkan Banner di Atas Header)</option>
                <option value="false">Disembunyikan (Sembunyikan Banner)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Color Palette & Custom Styling Config */}
        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 border-b pb-3 border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Palette className="size-5 text-indigo-500" />
            <span>Kustomisasi Warna &amp; Styling Rich Text Banner</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Color 1: Background Banner */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 space-y-3">
              <Label className="font-bold text-gray-900 dark:text-gray-100">1. Warna Background Banner</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.running_text_bg_color || "#0F172A"}
                  onChange={(e) => handleChange("running_text_bg_color", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                />
                <Input
                  value={settings.running_text_bg_color || "#0F172A"}
                  onChange={(e) => handleChange("running_text_bg_color", e.target.value)}
                  placeholder="#0F172A"
                  className="font-mono text-xs uppercase"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-semibold text-gray-400">Presets:</span>
                {[
                  { name: "Dark Slate", code: "#0F172A" },
                  { name: "Navy Indigo", code: "#1E1B4B" },
                  { name: "Midnight", code: "#020617" },
                  { name: "Dark Emerald", code: "#064E3B" },
                  { name: "Dark Wine", code: "#4C1D95" },
                ].map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => handleChange("running_text_bg_color", p.code)}
                    className="w-6 h-6 rounded-full border border-gray-300 shadow-xs cursor-pointer transition-transform hover:scale-110"
                    style={{ backgroundColor: p.code }}
                    title={p.name}
                  />
                ))}
              </div>
            </div>

            {/* Color 2: Main Text Color */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 space-y-3">
              <Label className="font-bold text-gray-900 dark:text-gray-100">2. Warna Teks Utama</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.running_text_main_color || "#FFFFFF"}
                  onChange={(e) => handleChange("running_text_main_color", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                />
                <Input
                  value={settings.running_text_main_color || "#FFFFFF"}
                  onChange={(e) => handleChange("running_text_main_color", e.target.value)}
                  placeholder="#FFFFFF"
                  className="font-mono text-xs uppercase"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-semibold text-gray-400">Presets:</span>
                {[
                  { name: "Pure White", code: "#FFFFFF" },
                  { name: "Soft Gray", code: "#E2E8F0" },
                  { name: "Cream", code: "#FEF3C7" },
                  { name: "Ice Blue", code: "#E0F2FE" },
                ].map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => handleChange("running_text_main_color", p.code)}
                    className="w-6 h-6 rounded-full border border-gray-300 shadow-xs cursor-pointer transition-transform hover:scale-110"
                    style={{ backgroundColor: p.code }}
                    title={p.name}
                  />
                ))}
              </div>
            </div>

            {/* Color 3: Highlight Text Color */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 space-y-3">
              <Label className="font-bold text-gray-900 dark:text-gray-100">3. Warna Teks Highlight (Promo)</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.running_text_highlight_color || "#0D9488"}
                  onChange={(e) => handleChange("running_text_highlight_color", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                />
                <Input
                  value={settings.running_text_highlight_color || "#0D9488"}
                  onChange={(e) => handleChange("running_text_highlight_color", e.target.value)}
                  placeholder="#0D9488"
                  className="font-mono text-xs uppercase"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-semibold text-gray-400">Presets:</span>
                {[
                  { name: "Teal Emerald", code: "#0D9488" },
                  { name: "Gold Amber", code: "#F59E0B" },
                  { name: "Neon Pink", code: "#EC4899" },
                  { name: "Cyan Blue", code: "#06B6D4" },
                  { name: "Vibrant Red", code: "#EF4444" },
                  { name: "Lime Green", code: "#84CC16" },
                ].map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => handleChange("running_text_highlight_color", p.code)}
                    className="w-6 h-6 rounded-full border border-gray-300 shadow-xs cursor-pointer transition-transform hover:scale-110"
                    style={{ backgroundColor: p.code }}
                    title={p.name}
                  />
                ))}
              </div>
            </div>

            {/* Color 4: CTA Button Color */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 space-y-3">
              <Label className="font-bold text-gray-900 dark:text-gray-100">4. Warna Tombol CTA</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.running_text_cta_color || "#F59E0B"}
                  onChange={(e) => handleChange("running_text_cta_color", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                />
                <Input
                  value={settings.running_text_cta_color || "#F59E0B"}
                  onChange={(e) => handleChange("running_text_cta_color", e.target.value)}
                  placeholder="#F59E0B"
                  className="font-mono text-xs uppercase"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-semibold text-gray-400">Presets:</span>
                {[
                  { name: "Amber Gold", code: "#F59E0B" },
                  { name: "Indigo Blue", code: "#6366F1" },
                  { name: "Emerald Green", code: "#10B981" },
                  { name: "Rose Pink", code: "#F43F5E" },
                  { name: "Sky Blue", code: "#38BDF8" },
                ].map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => handleChange("running_text_cta_color", p.code)}
                    className="w-6 h-6 rounded-full border border-gray-300 shadow-xs cursor-pointer transition-transform hover:scale-110"
                    style={{ backgroundColor: p.code }}
                    title={p.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* WhatsApp & Contact Info */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 border-b pb-2 border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Phone className="size-5 text-emerald-500" />
            <span>Kontak &amp; WhatsApp Floating</span>
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
            <span>SEO &amp; Copyright Footer</span>
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
          <Button type="submit" isLoading={saving} className="px-8 cursor-pointer">
            {saving ? "Memproses..." : "Simpan Semua Pengaturan"}
          </Button>
        </div>
      </form>
    </div>
  )
}

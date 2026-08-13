"use client"

import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { Textarea } from "@/components/Textarea"
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/Table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/Dialog"
import { TableSkeleton } from "@/components/TableSkeleton"
import { Edit, Upload } from "lucide-react"
import React, { useEffect, useState } from "react"
import { fetchApi, uploadFileApi } from "@/lib/api"

interface PageItem {
  id: string
  slug: string
  title: string
  heroBadge?: string
  heroTitle?: string
  heroDescription?: string
  heroImage?: string
  bodyContent?: string
  ctaText?: string
  ctaHref?: string
  isActive: boolean
}

export default function StaticPagesCMSPage() {
  const [pages, setPages] = useState<PageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<PageItem | null>(null)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    slug: "about-us",
    title: "Tentang JariBakat",
    heroBadge: "Platform Terbaik No.1 Indonesia",
    heroTitle: "Tentang JariBakat",
    heroDescription: "JariBakat merupakan platform analisis tes bakat & sidik jari...",
    heroImage: "",
    bodyContent: "Bukan sekadar anak pintar, tapi tahu dia pintar di bidang apa...",
    ctaText: "Keunggulan Kami",
    ctaHref: "#about-story",
    isActive: true,
  })

  const loadPages = async () => {
    try {
      const data = await fetchApi("/pages")
      setPages(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPages()
  }, [])

  const handleOpenEdit = (p: PageItem) => {
    setEditingItem(p)
    setForm({
      slug: p.slug,
      title: p.title,
      heroBadge: p.heroBadge || "",
      heroTitle: p.heroTitle || "",
      heroDescription: p.heroDescription || "",
      heroImage: p.heroImage || "",
      bodyContent: p.bodyContent || "",
      ctaText: p.ctaText || "",
      ctaHref: p.ctaHref || "",
      isActive: p.isActive,
    })
    setOpenModal(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadFileApi(file)
      setForm((prev) => ({ ...prev, heroImage: res.url }))
    } catch (err: any) {
      alert(`Upload gagal: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    try {
      await fetchApi(`/pages/${editingItem.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      })
      setOpenModal(false)
      loadPages()
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Kelola Halaman Statis
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Edit konten Banner Hero & Deskripsi untuk Halaman Tentang Kami (`/about-us`) & Expert Class (`/expert`)
        </p>
      </div>

      <Card className="p-0 overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Halaman Slug</TableHeaderCell>
              <TableHeaderCell>Judul Halaman</TableHeaderCell>
              <TableHeaderCell>Hero Badge</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi Edit</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton columns={5} />
            ) : pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-sm text-gray-500">
                  Belum ada halaman.
                </TableCell>
              </TableRow>
            ) : (
              pages.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs font-semibold text-blue-600">
                    /{p.slug}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-gray-50">
                    {p.title}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {p.heroBadge || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.isActive ? "success" : "warning"}>
                      {p.isActive ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="secondary" className="p-1.5" onClick={() => handleOpenEdit(p)}>
                      <Edit className="size-4 text-gray-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Dialog Form */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Halaman /{form.slug}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Judul Halaman</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Hero Badge Tag Text</Label>
              <Input
                value={form.heroBadge}
                onChange={(e) => setForm({ ...form, heroBadge: e.target.value })}
                placeholder="Platform Terbaik No.1 Indonesia"
              />
            </div>

            <div className="space-y-2">
              <Label>Hero Heading Title</Label>
              <Input
                value={form.heroTitle}
                onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                placeholder="Tentang JariBakat"
              />
            </div>

            <div className="space-y-2">
              <Label>Hero Description Paragraph</Label>
              <Textarea
                value={form.heroDescription}
                onChange={(e) => setForm({ ...form, heroDescription: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Hero Background Image URL (Opsional)</Label>
              <div className="flex gap-2">
                <Input
                  value={form.heroImage}
                  onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
                  placeholder="https://..."
                />
                <label className="cursor-pointer inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded-md border text-gray-700">
                  <Upload className="size-4 mr-1" />
                  {uploading ? "..." : "Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Body Content / Section Story (Text)</Label>
              <Textarea
                value={form.bodyContent}
                onChange={(e) => setForm({ ...form, bodyContent: e.target.value })}
                rows={4}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="secondary" onClick={() => setOpenModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Halaman</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/Table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/Dialog"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { TableSkeleton } from "@/components/TableSkeleton"
import { Plus, Edit, Trash2, Upload } from "lucide-react"
import React, { useEffect, useState } from "react"
import { fetchApi, uploadFileApi } from "@/lib/api"

interface BannerItem {
  id: string
  desktopImage: string
  mobileImage?: string
  alt: string
  ctaText: string
  ctaMobileText: string
  ctaHref: string
  sortOrder: number
  isActive: boolean
}

export default function BannersCMSPage() {
  const [banners, setBanners] = useState<BannerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null)
  const [uploading, setUploading] = useState(false)

  // Confirm delete modal states
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    desktopImage: "",
    mobileImage: "",
    alt: "Banner JariBakat",
    ctaText: "Lihat Paket",
    ctaMobileText: "Lihat",
    ctaHref: "/event",
    sortOrder: 0,
    isActive: true,
  })

  const loadBanners = async () => {
    try {
      const data = await fetchApi("/banners")
      setBanners(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBanners()
  }, [])

  const handleOpenCreate = () => {
    setEditingBanner(null)
    setForm({
      desktopImage: "",
      mobileImage: "",
      alt: "Banner JariBakat",
      ctaText: "Lihat Paket",
      ctaMobileText: "Lihat",
      ctaHref: "/event",
      sortOrder: banners.length,
      isActive: true,
    })
    setOpenModal(true)
  }

  const handleOpenEdit = (banner: BannerItem) => {
    setEditingBanner(banner)
    setForm({
      desktopImage: banner.desktopImage,
      mobileImage: banner.mobileImage || "",
      alt: banner.alt,
      ctaText: banner.ctaText,
      ctaMobileText: banner.ctaMobileText,
      ctaHref: banner.ctaHref,
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
    })
    setOpenModal(true)
  }

  const handleToggleStatus = async (banner: BannerItem) => {
    try {
      await fetchApi(`/banners/${banner.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...banner, isActive: !banner.isActive }),
      })
      loadBanners()
    } catch (err) {
      console.error("Toggle status error:", err)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "desktopImage" | "mobileImage") => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadFileApi(file)
      setForm((prev) => ({ ...prev, [field]: res.url }))
    } catch (err: any) {
      console.error("Upload error:", err)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingBanner) {
        await fetchApi(`/banners/${editingBanner.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        })
      } else {
        await fetchApi("/banners", {
          method: "POST",
          body: JSON.stringify(form),
        })
      }
      setOpenModal(false)
      loadBanners()
    } catch (err: any) {
      console.error("Submit error:", err)
    }
  }

  const promptDelete = (id: string) => {
    setDeleteId(id)
    setConfirmOpen(true)
  }

  const executeDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await fetchApi(`/banners/${deleteId}`, { method: "DELETE" })
      await loadBanners()
    } catch (err: any) {
      console.error("Delete error:", err)
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
            Kelola Hero Carousel Banner
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Gambar slide promo banner utama di halaman beranda
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 w-full sm:w-auto justify-center cursor-pointer">
          <Plus className="size-4" />
          <span>Tambah Banner</span>
        </Button>
      </div>

      <Card className="p-0 overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Gambar</TableHeaderCell>
              <TableHeaderCell>Alt Text</TableHeaderCell>
              <TableHeaderCell>CTA Button</TableHeaderCell>
              <TableHeaderCell>Link Href</TableHeaderCell>
              <TableHeaderCell>Status (Klik Ubah)</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton columns={6} />
            ) : banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-sm text-gray-500">
                  Belum ada banner. Klik &quot;Tambah Banner&quot; untuk menambahkan.
                </TableCell>
              </TableRow>
            ) : (
              banners.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="w-24 h-12 relative rounded bg-gray-100 overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={b.desktopImage} alt={b.alt} className="w-full h-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-50 max-w-xs truncate">
                    {b.alt}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="neutral">{b.ctaText}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 font-mono">
                    {b.ctaHref}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleStatus(b)}
                      title="Klik untuk mengubah status"
                      className="cursor-pointer focus:outline-none"
                    >
                      <Badge variant={b.isActive ? "success" : "warning"}>
                        {b.isActive ? "Aktif" : "Non-Aktif"}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="secondary" className="p-1.5 cursor-pointer" onClick={() => handleOpenEdit(b)}>
                      <Edit className="size-4 text-gray-600" />
                    </Button>
                    <Button variant="secondary" className="p-1.5 cursor-pointer" onClick={() => promptDelete(b.id)}>
                      <Trash2 className="size-4 text-red-500" />
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? "Edit Banner Hero" : "Tambah Banner Hero Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>URL Gambar Desktop</Label>
              <div className="flex gap-2">
                <Input
                  value={form.desktopImage}
                  onChange={(e) => setForm({ ...form, desktopImage: e.target.value })}
                  placeholder="https://... atau upload"
                  required
                />
                <label className="cursor-pointer inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded-md border text-gray-700">
                  <Upload className="size-4 mr-1" />
                  {uploading ? "..." : "Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "desktopImage")} />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL Gambar Mobile (Opsional)</Label>
              <div className="flex gap-2">
                <Input
                  value={form.mobileImage}
                  onChange={(e) => setForm({ ...form, mobileImage: e.target.value })}
                  placeholder="https://... (opsional)"
                />
                <label className="cursor-pointer inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded-md border text-gray-700">
                  <Upload className="size-4 mr-1" />
                  {uploading ? "..." : "Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "mobileImage")} />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Alt Text Deskripsi</Label>
              <Input
                value={form.alt}
                onChange={(e) => setForm({ ...form, alt: e.target.value })}
                placeholder="Paket Anak JariBakat..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teks Tombol CTA (Desktop)</Label>
                <Input
                  value={form.ctaText}
                  onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                  placeholder="Lihat Paket Bakat"
                />
              </div>
              <div className="space-y-2">
                <Label>Teks Tombol CTA (Mobile)</Label>
                <Input
                  value={form.ctaMobileText}
                  onChange={(e) => setForm({ ...form, ctaMobileText: e.target.value })}
                  placeholder="Lihat Paket"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CTA Link Href</Label>
                <Input
                  value={form.ctaHref}
                  onChange={(e) => setForm({ ...form, ctaHref: e.target.value })}
                  placeholder="/event"
                />
              </div>

              <div className="space-y-2">
                <Label>Status Publikasi</Label>
                <select
                  value={form.isActive ? "true" : "false"}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="true">Aktif (Tampil)</option>
                  <option value="false">Non-Aktif (Disembunyikan)</option>
                </select>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="secondary" onClick={() => setOpenModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Banner</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog Component */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus Banner Slide?"
        description="Apakah Anda yakin ingin menghapus banner ini dari Hero Carousel beranda?"
        confirmText="Hapus Banner"
        loading={deleting}
        onConfirm={executeDelete}
      />
    </div>
  )
}

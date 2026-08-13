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

interface VideoCourseItem {
  id: string
  slug: string
  title: string
  category: string
  views: number
  lessons: number
  duration: string
  rating: number
  reviewsCount: number
  originalPrice: string
  price: string
  image: string
  href: string
  isActive: boolean
}

export default function VideoCoursesCMSPage() {
  const [courses, setCourses] = useState<VideoCourseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<VideoCourseItem | null>(null)
  const [uploading, setUploading] = useState(false)

  // Confirm delete modal states
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    slug: "",
    title: "",
    category: "Emotion",
    views: 100,
    lessons: 4,
    duration: "1h 00m",
    rating: 5.0,
    reviewsCount: 10,
    originalPrice: "Rp75,000",
    price: "Rp70,000",
    image: "",
    href: "https://wa.me/6281915237935",
    isActive: true,
  })

  const loadCourses = async () => {
    try {
      const data = await fetchApi("/video-courses")
      setCourses(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setForm({
      slug: `video-${Date.now()}`,
      title: "",
      category: "Emotion",
      views: 100,
      lessons: 4,
      duration: "1h 00m",
      rating: 5.0,
      reviewsCount: 10,
      originalPrice: "Rp75,000",
      price: "Rp70,000",
      image: "",
      href: "https://wa.me/6281915237935",
      isActive: true,
    })
    setOpenModal(true)
  }

  const handleOpenEdit = (c: VideoCourseItem) => {
    setEditingItem(c)
    setForm({
      slug: c.slug,
      title: c.title,
      category: c.category,
      views: c.views,
      lessons: c.lessons,
      duration: c.duration,
      rating: c.rating || 5.0,
      reviewsCount: c.reviewsCount || 10,
      originalPrice: c.originalPrice,
      price: c.price,
      image: c.image,
      href: c.href || "https://wa.me/6281915237935",
      isActive: c.isActive,
    })
    setOpenModal(true)
  }

  const handleToggleStatus = async (c: VideoCourseItem) => {
    try {
      await fetchApi(`/video-courses/${c.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...c, isActive: !c.isActive }),
      })
      loadCourses()
    } catch (err) {
      console.error(err)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadFileApi(file)
      setForm((prev) => ({ ...prev, image: res.url }))
    } catch (err: any) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await fetchApi(`/video-courses/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        })
      } else {
        await fetchApi("/video-courses", {
          method: "POST",
          body: JSON.stringify(form),
        })
      }
      setOpenModal(false)
      loadCourses()
    } catch (err: any) {
      console.error(err)
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
      await fetchApi(`/video-courses/${deleteId}`, { method: "DELETE" })
      await loadCourses()
    } catch (err: any) {
      console.error(err)
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
            Kelola Video Pembelajaran
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Katalog video pembelajaran mandiri &amp; rekaman webinar
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 w-full sm:w-auto justify-center cursor-pointer">
          <Plus className="size-4" />
          <span>Tambah Video Course</span>
        </Button>
      </div>

      <Card className="p-0 overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Cover</TableHeaderCell>
              <TableHeaderCell>Judul Video</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Materi &amp; Durasi</TableHeaderCell>
              <TableHeaderCell>Rating</TableHeaderCell>
              <TableHeaderCell>Harga</TableHeaderCell>
              <TableHeaderCell>Status (Klik Ubah)</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton columns={8} />
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-sm text-gray-500">
                  Belum ada video course.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="w-12 h-12 relative rounded bg-gray-100 overflow-hidden border">
                      <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-gray-50 max-w-xs truncate">
                    {c.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral">{c.category}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {c.lessons} Materi • {c.duration} ({c.views} views)
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-amber-500">
                    ★ {c.rating || 5.0} ({c.reviewsCount || 10})
                  </TableCell>
                  <TableCell className="font-bold text-amber-600 text-xs">
                    {c.price}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleStatus(c)}
                      title="Klik untuk mengubah status"
                      className="cursor-pointer focus:outline-none"
                    >
                      <Badge variant={c.isActive ? "success" : "warning"}>
                        {c.isActive ? "Aktif" : "Non-Aktif"}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="secondary" className="p-1.5 cursor-pointer" onClick={() => handleOpenEdit(c)}>
                      <Edit className="size-4 text-gray-600" />
                    </Button>
                    <Button variant="secondary" className="p-1.5 cursor-pointer" onClick={() => promptDelete(c.id)}>
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
              {editingItem ? "Edit Video Course" : "Tambah Video Course Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Judul Video Course</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Mengenal dan Menghadapi Pemicu Emosi"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Emotion / Trauma / Parenting"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="mengenal-pemicu-emosi"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Jumlah Materi</Label>
                <Input
                  type="number"
                  value={form.lessons}
                  onChange={(e) => setForm({ ...form, lessons: parseInt(e.target.value, 10) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Durasi Video</Label>
                <Input
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="1h 15m"
                />
              </div>
              <div className="space-y-2">
                <Label>Jumlah Dilihat</Label>
                <Input
                  type="number"
                  value={form.views}
                  onChange={(e) => setForm({ ...form, views: parseInt(e.target.value, 10) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rating Star (1.0 - 5.0)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 5.0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Jumlah Review</Label>
                <Input
                  type="number"
                  value={form.reviewsCount}
                  onChange={(e) => setForm({ ...form, reviewsCount: parseInt(e.target.value, 10) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harga</Label>
                <Input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="Rp70,000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Asli (Strikethrough)</Label>
                <Input
                  value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                  placeholder="Rp85,000"
                />
              </div>
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

            <div className="space-y-2">
              <Label>Link Beli / WhatsApp Action Href</Label>
              <Input
                value={form.href}
                onChange={(e) => setForm({ ...form, href: e.target.value })}
                placeholder="https://wa.me/6281915237935"
              />
            </div>

            <div className="space-y-2">
              <Label>URL Thumbnail Image</Label>
              <div className="flex gap-2">
                <Input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  required
                />
                <label className="cursor-pointer inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded-md border text-gray-700">
                  <Upload className="size-4 mr-1" />
                  {uploading ? "..." : "Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="secondary" onClick={() => setOpenModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Course</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog Component */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus Video Course?"
        description="Apakah Anda yakin ingin menghapus materi video course ini?"
        confirmText="Hapus Course"
        loading={deleting}
        onConfirm={executeDelete}
      />
    </div>
  )
}

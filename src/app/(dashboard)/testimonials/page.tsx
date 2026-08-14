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
import { Plus, Edit, Trash2, Upload, Play, Star } from "lucide-react"
import React, { useEffect, useState } from "react"
import { fetchApi, uploadFileApi } from "@/lib/api"

interface TestimonialItem {
  id: string
  name: string
  role: string
  avatar?: string
  videoUrl: string
  thumbnail: string
  title?: string
  quote?: string
  rating: number
  sortOrder: number
  isActive: boolean
}

export default function TestimonialsCMSPage() {
  const [items, setItems] = useState<TestimonialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)

  // Confirm delete modal states
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    name: "",
    role: "Orang Tua Peserta Tes Bakat",
    avatar: "",
    videoUrl: "",
    thumbnail: "",
    title: "",
    quote: "",
    rating: 5,
    sortOrder: 0,
    isActive: true,
  })

  const loadTestimonials = async () => {
    try {
      const data = await fetchApi("/testimonials")
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTestimonials()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setForm({
      name: "",
      role: "Orang Tua Peserta Tes Bakat",
      avatar: "",
      videoUrl: "",
      thumbnail: "",
      title: "",
      quote: "",
      rating: 5,
      sortOrder: items.length,
      isActive: true,
    })
    setOpenModal(true)
  }

  const handleOpenEdit = (item: TestimonialItem) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      role: item.role,
      avatar: item.avatar || "",
      videoUrl: item.videoUrl,
      thumbnail: item.thumbnail,
      title: item.title || "",
      quote: item.quote || "",
      rating: item.rating || 5,
      sortOrder: item.sortOrder || 0,
      isActive: item.isActive,
    })
    setOpenModal(true)
  }

  const handleToggleStatus = async (item: TestimonialItem) => {
    try {
      await fetchApi(`/testimonials/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...item, isActive: !item.isActive }),
      })
      loadTestimonials()
    } catch (err) {
      console.error(err)
    }
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "videoUrl" | "thumbnail" | "avatar"
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(field)
    try {
      const res = await uploadFileApi(file)
      setForm((prev) => ({ ...prev, [field]: res.url }))
    } catch (err: any) {
      console.error(err)
    } finally {
      setUploading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await fetchApi(`/testimonials/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        })
      } else {
        await fetchApi("/testimonials", {
          method: "POST",
          body: JSON.stringify(form),
        })
      }
      setOpenModal(false)
      loadTestimonials()
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
      await fetchApi(`/testimonials/${deleteId}`, { method: "DELETE" })
      await loadTestimonials()
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
            Kelola Video Testimoni
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Kelola video ulasan dan testimoni peserta/orang tua yang tampil di halaman utama JariBakat
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 w-full sm:w-auto justify-center cursor-pointer">
          <Plus className="size-4" />
          <span>Tambah Video Testimoni</span>
        </Button>
      </div>

      <Card className="p-0 overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Cover &amp; Video</TableHeaderCell>
              <TableHeaderCell>Nama &amp; Peran</TableHeaderCell>
              <TableHeaderCell>Judul &amp; Kutipan Testimoni</TableHeaderCell>
              <TableHeaderCell>Rating</TableHeaderCell>
              <TableHeaderCell>Urutan</TableHeaderCell>
              <TableHeaderCell>Status (Klik Ubah)</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton columns={7} />
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-sm text-gray-500">
                  Belum ada video testimoni. Silakan tambah testimoni baru.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="w-16 h-12 relative rounded bg-gray-100 overflow-hidden border group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="size-4 text-white fill-white" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-gray-50">
                    <div className="flex items-center gap-2">
                      {item.avatar && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={item.avatar} alt={item.name} className="w-6 h-6 rounded-full object-cover border" />
                      )}
                      <div>
                        <div>{item.name}</div>
                        <div className="text-xs text-gray-400 font-normal">{item.role}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="font-medium text-xs text-gray-800 dark:text-gray-200 truncate">
                      {item.title || "-"}
                    </div>
                    <div className="text-xs text-gray-400 line-clamp-1 italic">
                      &quot;{item.quote || "-"}&quot;
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star className="size-3.5 fill-amber-500 text-amber-500" />
                      <span>{item.rating || 5}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{item.sortOrder}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleStatus(item)}
                      title="Klik untuk mengubah status"
                      className="cursor-pointer focus:outline-none"
                    >
                      <Badge variant={item.isActive ? "success" : "warning"}>
                        {item.isActive ? "Aktif" : "Non-Aktif"}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="secondary" className="p-1.5 cursor-pointer" onClick={() => handleOpenEdit(item)}>
                      <Edit className="size-4 text-gray-600" />
                    </Button>
                    <Button variant="secondary" className="p-1.5 cursor-pointer" onClick={() => promptDelete(item.id)}>
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Video Testimoni" : "Tambah Video Testimoni Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Pemberi Testimoni</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Bunda Anita &amp; Ananda Rayhan"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Peran / Profesi</Label>
                <Input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="Orang Tua Peserta Tes Bakat"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Judul Highlight Testimoni</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Hasil Analisa Bakat Membantu Menemukan Minat Anak Sejak Dini"
              />
            </div>

            <div className="space-y-2">
              <Label>Kutipan Singkat (Quote)</Label>
              <textarea
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                placeholder="Awalnya bingung mengarahkan bakat anak, setelah ikutan tes fingerprint di JariBakat jadi jelas banget potensi terpendamnya..."
                className="w-full min-h-[70px] rounded-md border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label>URL Video (.mp4 / MinIO / YouTube / Vimeo)</Label>
              <div className="flex gap-2">
                <Input
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://storage.alliago.id/.../video.mp4 atau https://www.youtube.com/watch?v=..."
                  required
                />
                <label className="cursor-pointer inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded-md border text-gray-700">
                  <Upload className="size-4 mr-1" />
                  {uploading === "videoUrl" ? "..." : "Upload Video"}
                  <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, "videoUrl")} />
                </label>
              </div>
              <p className="text-[11px] text-gray-400">Bisa upload file video MP4 langsung atau masukkan link YouTube/Vimeo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>URL Gambar Cover Thumbnail Video</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.thumbnail}
                    onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                    placeholder="https://..."
                    required
                  />
                  <label className="cursor-pointer inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded-md border text-gray-700">
                    <Upload className="size-4 mr-1" />
                    {uploading === "thumbnail" ? "..." : "Upload Cover"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "thumbnail")} />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>URL Foto Profil Avatar (Opsional)</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.avatar}
                    onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                    placeholder="https://..."
                  />
                  <label className="cursor-pointer inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded-md border text-gray-700">
                    <Upload className="size-4 mr-1" />
                    {uploading === "avatar" ? "..." : "Upload"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "avatar")} />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Rating (1 - 5)</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  step={0.1}
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 5 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Urutan Tampil (Sort Order)</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Status Publikasi</Label>
                <select
                  value={form.isActive ? "true" : "false"}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="true">Aktif (Tampil di Home)</option>
                  <option value="false">Non-Aktif (Disembunyikan)</option>
                </select>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="secondary" onClick={() => setOpenModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Video Testimoni</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog Component */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus Video Testimoni?"
        description="Apakah Anda yakin ingin menghapus video testimoni ini? Data yang terhapus tidak dapat dikembalikan."
        confirmText="Hapus Testimoni"
        loading={deleting}
        onConfirm={executeDelete}
      />
    </div>
  )
}

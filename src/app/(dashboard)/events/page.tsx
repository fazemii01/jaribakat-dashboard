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

interface EventItem {
  id: string
  title: string
  type: string
  category: "online" | "offline" | "expert"
  speaker: string
  speakerRole: string
  speakerImage: string
  date: string
  time: string
  location: string
  image: string
  price: string
  originalPrice?: string
  badge?: string
  topic?: string
  href: string
  isActive: boolean
}

export default function EventsCMSPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<EventItem | null>(null)
  const [uploading, setUploading] = useState(false)

  // Confirm delete modal states
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    title: "",
    type: "Tes Bakat Anak",
    category: "online" as "online" | "offline" | "expert",
    speaker: "Tim Konsultan JariBakat",
    speakerRole: "Certified Fingerprint Analyst JariBakat",
    speakerImage: "https://storage.alliago.id/jaribakat-new/speakers/speaker-1.png",
    date: "Akses Fleksibel",
    time: "Sesuai Jadwal Pilihan",
    location: "Online / Center JariBakat",
    image: "",
    price: "Rp 350.000",
    originalPrice: "",
    badge: "Terpopuler",
    topic: "",
    href: "https://wa.me/6285196235285",
    isActive: true,
  })

  const loadEvents = async () => {
    try {
      const data = await fetchApi("/events")
      setEvents(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setForm({
      title: "",
      type: "Tes Bakat Anak",
      category: "online",
      speaker: "Tim Konsultan JariBakat",
      speakerRole: "Certified Fingerprint Analyst JariBakat",
      speakerImage: "https://storage.alliago.id/jaribakat-new/speakers/speaker-1.png",
      date: "Akses Fleksibel",
      time: "Sesuai Jadwal Pilihan",
      location: "Online / Center JariBakat",
      image: "",
      price: "Rp 350.000",
      originalPrice: "",
      badge: "Terpopuler",
      topic: "",
      href: "https://wa.me/6285196235285",
      isActive: true,
    })
    setOpenModal(true)
  }

  const handleOpenEdit = (evt: EventItem) => {
    setEditingItem(evt)
    setForm({
      title: evt.title,
      type: evt.type,
      category: evt.category || "online",
      speaker: evt.speaker,
      speakerRole: evt.speakerRole,
      speakerImage: evt.speakerImage || "",
      date: evt.date || "Akses Fleksibel",
      time: evt.time || "Sesuai Jadwal Pilihan",
      location: evt.location || "Online / Center JariBakat",
      image: evt.image,
      price: evt.price,
      originalPrice: evt.originalPrice || "",
      badge: evt.badge || "",
      topic: evt.topic || "",
      href: evt.href,
      isActive: evt.isActive,
    })
    setOpenModal(true)
  }

  const handleToggleStatus = async (evt: EventItem) => {
    try {
      await fetchApi(`/events/${evt.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...evt, isActive: !evt.isActive }),
      })
      loadEvents()
    } catch (err) {
      console.error(err)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "image" | "speakerImage") => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadFileApi(file)
      setForm((prev) => ({ ...prev, [field]: res.url }))
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
        await fetchApi(`/events/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        })
      } else {
        await fetchApi("/events", {
          method: "POST",
          body: JSON.stringify(form),
        })
      }
      setOpenModal(false)
      loadEvents()
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
      await fetchApi(`/events/${deleteId}`, { method: "DELETE" })
      await loadEvents()
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
            Kelola Event &amp; Katalog Paket Bakat
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Katalog paket tes bakat yang ditampilkan di halaman Event &amp; Kalender
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 w-full sm:w-auto justify-center cursor-pointer">
          <Plus className="size-4" />
          <span>Tambah Event/Paket</span>
        </Button>
      </div>

      <Card className="p-0 overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Gambar</TableHeaderCell>
              <TableHeaderCell>Judul Event / Paket</TableHeaderCell>
              <TableHeaderCell>Kategori &amp; Tipe</TableHeaderCell>
              <TableHeaderCell>Pembicara / Analyst</TableHeaderCell>
              <TableHeaderCell>Jadwal &amp; Lokasi</TableHeaderCell>
              <TableHeaderCell>Harga</TableHeaderCell>
              <TableHeaderCell>Status (Klik Ubah)</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton columns={8} />
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-sm text-gray-500">
                  Belum ada event/paket.
                </TableCell>
              </TableRow>
            ) : (
              events.map((evt) => (
                <TableRow key={evt.id}>
                  <TableCell>
                    <div className="w-12 h-12 relative rounded bg-gray-100 overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-gray-50 max-w-xs truncate">
                    {evt.title}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={evt.category === "online" ? "neutral" : evt.category === "offline" ? "success" : "warning"}>
                        {(evt.category || "online").toUpperCase()}
                      </Badge>
                      <span className="text-[11px] font-medium text-gray-500">{evt.type}</span>
                      {evt.badge && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">{evt.badge}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    <div className="font-medium">{evt.speaker}</div>
                    <div className="text-gray-400 text-[10px]">{evt.speakerRole}</div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    <div>{evt.date} • {evt.time}</div>
                    <div className="text-gray-400 text-[10px]">{evt.location}</div>
                  </TableCell>
                  <TableCell className="font-bold text-amber-600 text-xs">
                    {evt.price}
                    {evt.originalPrice && <div className="text-[10px] text-gray-400 line-through font-normal">{evt.originalPrice}</div>}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleStatus(evt)}
                      title="Klik untuk mengubah status"
                      className="cursor-pointer focus:outline-none"
                    >
                      <Badge variant={evt.isActive ? "success" : "warning"}>
                        {evt.isActive ? "Aktif" : "Non-Aktif"}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="secondary" className="p-1.5 cursor-pointer" onClick={() => handleOpenEdit(evt)}>
                      <Edit className="size-4 text-gray-600" />
                    </Button>
                    <Button variant="secondary" className="p-1.5 cursor-pointer" onClick={() => promptDelete(evt.id)}>
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Form Dialog */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Event & Paket" : "Tambah Event & Paket Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Judul Paket / Event</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Paket Anak (Basic) - Analisa Potensi..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Kategori Event</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="online">Online Event</option>
                  <option value="offline">Offline Event</option>
                  <option value="expert">Expert Class</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Label Tipe Event</Label>
                <Input
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  placeholder="Tes Bakat Anak"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Speaker / Analyst Name</Label>
                <Input
                  value={form.speaker}
                  onChange={(e) => setForm({ ...form, speaker: e.target.value })}
                  placeholder="Tim Konsultan JariBakat"
                />
              </div>
              <div className="space-y-2">
                <Label>Speaker Role / Title</Label>
                <Input
                  value={form.speakerRole}
                  onChange={(e) => setForm({ ...form, speakerRole: e.target.value })}
                  placeholder="Certified Fingerprint Analyst JariBakat"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tanggal / Jadwal Hari</Label>
                <Input
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  placeholder="Akses Fleksibel"
                />
              </div>
              <div className="space-y-2">
                <Label>Waktu / Jam Sesi</Label>
                <Input
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="Sesuai Jadwal Pilihan"
                />
              </div>
              <div className="space-y-2">
                <Label>Lokasi / Mode Venue</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Online / Center JariBakat"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harga Display</Label>
                <Input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="Rp 350.000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Coret (Original Price)</Label>
                <Input
                  value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                  placeholder="Rp 500.000 (opsional)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL Foto Speaker (Opsional)</Label>
              <div className="flex gap-2">
                <Input
                  value={form.speakerImage}
                  onChange={(e) => setForm({ ...form, speakerImage: e.target.value })}
                  placeholder="https://..."
                />
                <label className="cursor-pointer inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded-md border text-gray-700">
                  <Upload className="size-4 mr-1" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "speakerImage")} />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL Gambar Cover</Label>
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
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "image")} />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tag Topik (untuk filter di halaman /topic)</Label>
              <Input
                value={form.topic || ""}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                placeholder="emotion / trauma / anxiety (slug topik, opsional)"
              />
              <p className="text-[11px] text-gray-400">Isi dengan slug topik (contoh: emotion, trauma, anxiety). Kosongkan jika tidak ingin muncul di filter topik.</p>
            </div>

            <div className="space-y-2">
              <Label>Link Pendaftaran (WhatsApp / URL)</Label>
              <Input
                value={form.href}
                onChange={(e) => setForm({ ...form, href: e.target.value })}
                placeholder="https://wa.me/6285196235285"
              />
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="secondary" onClick={() => setOpenModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Event</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog Component */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus Event / Paket Bakat?"
        description="Apakah Anda yakin ingin menghapus event ini? Data yang terhapus tidak dapat dikembalikan."
        confirmText="Hapus Event"
        loading={deleting}
        onConfirm={executeDelete}
      />
    </div>
  )
}

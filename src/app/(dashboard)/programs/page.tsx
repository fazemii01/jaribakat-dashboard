"use client"

import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { Textarea } from "@/components/Textarea"
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/Table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/Dialog"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { TableSkeleton } from "@/components/TableSkeleton"
import { Plus, Edit, Trash2, Upload } from "lucide-react"
import React, { useEffect, useState } from "react"
import { fetchApi, uploadFileApi } from "@/lib/api"

interface ProgramItem {
  id: string
  slug: string
  title: string
  description: string
  image: string
  href: string
  category: "online" | "offline" | "expert"
  subCategory?: string
  speaker: string
  speakerRole: string
  speakerImage?: string
  date: string
  time: string
  location: string
  price: string
  originalPrice?: string
  badge?: string
  sortOrder: number
  isActive: boolean
}

export default function ProgramsCMSPage() {
  const [programs, setPrograms] = useState<ProgramItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"all" | "online" | "offline" | "expert">("all")
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ProgramItem | null>(null)
  const [uploading, setUploading] = useState(false)

  // Confirm delete modal states
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    slug: "",
    title: "",
    description: "",
    image: "",
    href: "https://wa.me/6285196235285",
    category: "online" as "online" | "offline" | "expert",
    subCategory: "Webinar & Workshop",
    speaker: "Tim Konsultan JariBakat",
    speakerRole: "Certified Fingerprint Analyst JariBakat",
    speakerImage: "",
    date: "Akses Fleksibel",
    time: "Sesuai Jadwal Pilihan",
    location: "Online / Home Service / Center JariBakat",
    price: "Rp 350.000",
    originalPrice: "",
    badge: "",
    sortOrder: 0,
    isActive: true,
  })

  const loadPrograms = async () => {
    try {
      const data = await fetchApi("/programs")
      setPrograms(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrograms()
  }, [])

  const filteredPrograms = programs.filter((p) => activeTab === "all" || p.category === activeTab)

  const handleOpenCreate = () => {
    setEditingItem(null)
    const cat = activeTab === "all" ? "online" : activeTab
    const defaultSubCat = cat === "online" ? "Webinar & Workshop" : cat === "offline" ? "Offline Gathering" : "Pelatihan Profesional"

    setForm({
      slug: `program-${Date.now()}`,
      title: "",
      description: "",
      image: "",
      href: "https://wa.me/6285196235285",
      category: cat,
      subCategory: defaultSubCat,
      speaker: "Tim Konsultan JariBakat",
      speakerRole: "Certified Fingerprint Analyst JariBakat",
      speakerImage: "",
      date: "Akses Fleksibel",
      time: "Sesuai Jadwal Pilihan",
      location: "Online / Home Service / Center JariBakat",
      price: "Rp 350.000",
      originalPrice: "",
      badge: "Terpopuler",
      sortOrder: programs.length,
      isActive: true,
    })
    setOpenModal(true)
  }

  const handleOpenEdit = (prog: ProgramItem) => {
    setEditingItem(prog)
    setForm({
      slug: prog.slug,
      title: prog.title,
      description: prog.description,
      image: prog.image,
      href: prog.href,
      category: prog.category,
      subCategory: prog.subCategory || "Webinar & Workshop",
      speaker: prog.speaker || "Tim Konsultan JariBakat",
      speakerRole: prog.speakerRole || "Certified Fingerprint Analyst JariBakat",
      speakerImage: prog.speakerImage || "",
      date: prog.date || "Akses Fleksibel",
      time: prog.time || "Sesuai Jadwal Pilihan",
      location: prog.location || "Online / Center JariBakat",
      price: prog.price || "Rp 350.000",
      originalPrice: prog.originalPrice || "",
      badge: prog.badge || "",
      sortOrder: prog.sortOrder,
      isActive: prog.isActive,
    })
    setOpenModal(true)
  }

  const handleToggleStatus = async (prog: ProgramItem) => {
    try {
      await fetchApi(`/programs/${prog.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...prog, isActive: !prog.isActive }),
      })
      loadPrograms()
    } catch (err) {
      console.error(err)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: "image" | "speakerImage") => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadFileApi(file)
      setForm((prev) => ({ ...prev, [fieldKey]: res.url }))
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
        await fetchApi(`/programs/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        })
      } else {
        await fetchApi("/programs", {
          method: "POST",
          body: JSON.stringify(form),
        })
      }
      setOpenModal(false)
      loadPrograms()
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
      await fetchApi(`/programs/${deleteId}`, { method: "DELETE" })
      await loadPrograms()
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
            Kelola Program Layanan
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Online Programs, Offline Roadshows, &amp; Expert Class Consultations
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 w-full sm:w-auto justify-center cursor-pointer">
          <Plus className="size-4" />
          <span>Tambah Program</span>
        </Button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto scrollbar-none">
        {(["all", "online", "offline", "expert"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? "bg-blue-50 text-[#1E1B4B] dark:bg-blue-950/50 dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400"
            }`}
          >
            {tab === "all" ? "Semua Category" : tab === "online" ? "Online Programs" : tab === "offline" ? "Offline Programs" : "Expert Consultations"}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Gambar</TableHeaderCell>
              <TableHeaderCell>Judul &amp; Badge</TableHeaderCell>
              <TableHeaderCell>Grup / Sub-Kategori Navbar</TableHeaderCell>
              <TableHeaderCell>Analyst / Speaker</TableHeaderCell>
              <TableHeaderCell>Jadwal &amp; Lokasi</TableHeaderCell>
              <TableHeaderCell>Harga</TableHeaderCell>
              <TableHeaderCell>Status (Klik Ubah)</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton columns={8} />
            ) : filteredPrograms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-sm text-gray-500">
                  Tidak ada program ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredPrograms.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="w-12 h-12 relative rounded bg-gray-100 overflow-hidden border">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-gray-900 dark:text-gray-50">{p.title}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant={p.category === "online" ? "neutral" : p.category === "offline" ? "success" : "warning"}>
                        {p.category.toUpperCase()}
                      </Badge>
                      {p.badge && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">{p.badge}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral" className="bg-indigo-50 text-[#1E1B4B] font-bold">
                      {p.subCategory || "Webinar & Workshop"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{p.speaker || "Tim Konsultan JariBakat"}</div>
                    <div className="text-gray-400">{p.speakerRole}</div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    <div>{p.date} • {p.time}</div>
                    <div className="text-gray-400">{p.location}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-amber-600 dark:text-amber-400 text-sm">{p.price || "Rp 350.000"}</div>
                    {p.originalPrice && <div className="text-xs text-gray-400 line-through">{p.originalPrice}</div>}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleStatus(p)}
                      title="Klik untuk mengubah status"
                      className="cursor-pointer focus:outline-none"
                    >
                      <Badge variant={p.isActive ? "success" : "warning"}>
                        {p.isActive ? "Aktif" : "Non-Aktif"}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="secondary" className="p-1.5 cursor-pointer" onClick={() => handleOpenEdit(p)}>
                      <Edit className="size-4 text-gray-600" />
                    </Button>
                    <Button variant="secondary" className="p-1.5 cursor-pointer" onClick={() => promptDelete(p.id)}>
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
              {editingItem ? "Edit Program Layanan" : "Tambah Program Layanan Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Judul Program</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Paket Anak (Basic) – Analisa Potensi &amp; Gaya Belajar"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Kategori Utama Mega Menu</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="online">Online Program</option>
                  <option value="offline">Offline Program</option>
                  <option value="expert">Expert Class</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Sub-Kategori / Group Navbar Header</Label>
                <Input
                  value={form.subCategory}
                  onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                  placeholder="Contoh: Webinar & Workshop, Belajar Mandiri, dll."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Slug URL</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="paket-anak"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Badge Label (Opsional)</Label>
                <Input
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  placeholder="Terpopuler / Best Value"
                />
              </div>

              <div className="space-y-2">
                <Label>Status Publikasi</Label>
                <select
                  value={form.isActive ? "true" : "false"}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="true">Aktif (Tampil di Landing Page)</option>
                  <option value="false">Non-Aktif (Disembunyikan)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Harga Display (Utama)</Label>
                <Input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="Rp 350.000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Harga Coret / Original Price (Opsional)</Label>
                <Input
                  value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                  placeholder="Rp 500.000"
                />
              </div>

              <div className="space-y-2">
                <Label>Nama Analyst / Speaker</Label>
                <Input
                  value={form.speaker}
                  onChange={(e) => setForm({ ...form, speaker: e.target.value })}
                  placeholder="Tim Konsultan JariBakat"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Gelar / Credential Analyst</Label>
                <Input
                  value={form.speakerRole}
                  onChange={(e) => setForm({ ...form, speakerRole: e.target.value })}
                  placeholder="Certified Fingerprint Analyst JariBakat"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Jadwal Tanggal</Label>
                <Input
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  placeholder="Akses Fleksibel"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Waktu Sesi</Label>
                <Input
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="Sesuai Jadwal Pilihan"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Lokasi / Mode Layanan</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Online / Home Service / Center JariBakat"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Deskripsi Ringkas</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Analisa bakat &amp; potensi dasar anak..."
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>URL Gambar Cover Program</Label>
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

              <div className="space-y-2 md:col-span-2">
                <Label>Link WhatsApp / Action Href</Label>
                <Input
                  value={form.href}
                  onChange={(e) => setForm({ ...form, href: e.target.value })}
                  placeholder="https://wa.me/6285196235285"
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="secondary" onClick={() => setOpenModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Program</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog Component */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus Program Layanan?"
        description="Apakah Anda yakin ingin menghapus program ini? Data yang terhapus tidak dapat dikembalikan."
        confirmText="Hapus Program"
        loading={deleting}
        onConfirm={executeDelete}
      />
    </div>
  )
}

"use client"

import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/Table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/Dialog"
import { Plus, Edit, Trash2, Upload } from "lucide-react"
import React, { useEffect, useState } from "react"
import { fetchApi, uploadFileApi } from "@/lib/api"

interface TopicItem {
  id: string
  slug: string
  name: string
  icon: string
  href: string
  showInNav: boolean
  showOnHome: boolean
  sortOrder: number
  isActive: boolean
}

export default function TopicsCMSPage() {
  const [topics, setTopics] = useState<TopicItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<TopicItem | null>(null)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    slug: "",
    name: "",
    icon: "",
    href: "/topic",
    showInNav: true,
    showOnHome: true,
    sortOrder: 0,
    isActive: true,
  })

  const loadTopics = async () => {
    try {
      const data = await fetchApi("/topics")
      setTopics(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTopics()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setForm({
      slug: `topic-${Date.now()}`,
      name: "",
      icon: "",
      href: "/topic",
      showInNav: true,
      showOnHome: true,
      sortOrder: topics.length,
      isActive: true,
    })
    setOpenModal(true)
  }

  const handleOpenEdit = (top: TopicItem) => {
    setEditingItem(top)
    setForm({
      slug: top.slug,
      name: top.name,
      icon: top.icon,
      href: top.href,
      showInNav: top.showInNav,
      showOnHome: top.showOnHome,
      sortOrder: top.sortOrder,
      isActive: top.isActive,
    })
    setOpenModal(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadFileApi(file)
      setForm((prev) => ({ ...prev, icon: res.url }))
    } catch (err: any) {
      alert(`Upload gagal: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await fetchApi(`/topics/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        })
      } else {
        await fetchApi("/topics", {
          method: "POST",
          body: JSON.stringify(form),
        })
      }
      setOpenModal(false)
      loadTopics()
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus topik ini?")) return
    try {
      await fetchApi(`/topics/${id}`, { method: "DELETE" })
      loadTopics()
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
            Kelola Topik & Kategori
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Topik tag yang tampil di mega menu Navbar dan homepage section
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 w-full sm:w-auto justify-center">
          <Plus className="size-4" />
          <span>Tambah Topik</span>
        </Button>
      </div>

      <Card className="p-0 overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Icon</TableHeaderCell>
              <TableHeaderCell>Nama Topik</TableHeaderCell>
              <TableHeaderCell>Slug</TableHeaderCell>
              <TableHeaderCell>Tampil di Nav</TableHeaderCell>
              <TableHeaderCell>Tampil di Home</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-sm text-gray-500">
                  Memuat data topik...
                </TableCell>
              </TableRow>
            ) : topics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-sm text-gray-500">
                  Belum ada topik.
                </TableCell>
              </TableRow>
            ) : (
              topics.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="w-8 h-8 rounded bg-gray-100 p-1 flex items-center justify-center border">
                      <img src={t.icon} alt={t.name} className="w-full h-full object-contain" />
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-gray-50">
                    {t.name}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 font-mono">
                    {t.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.showInNav ? "neutral" : "warning"}>
                      {t.showInNav ? "Ya" : "Tidak"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.showOnHome ? "neutral" : "warning"}>
                      {t.showOnHome ? "Ya" : "Tidak"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.isActive ? "success" : "warning"}>
                      {t.isActive ? "Aktif" : "Non-Aktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="secondary" className="p-1.5" onClick={() => handleOpenEdit(t)}>
                      <Edit className="size-4 text-gray-600" />
                    </Button>
                    <Button variant="secondary" className="p-1.5" onClick={() => handleDelete(t.id)}>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Topik" : "Tambah Topik Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Topik</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Gaya Belajar"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Slug URL</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value, href: `/topic?topic=${e.target.value}` })}
                placeholder="gaya-belajar"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>URL Icon (SVG/PNG)</Label>
              <div className="flex gap-2">
                <Input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
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

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showInNav}
                  onChange={(e) => setForm({ ...form, showInNav: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Tampil di Navbar</span>
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showOnHome}
                  onChange={(e) => setForm({ ...form, showOnHome: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Tampil di Homepage</span>
              </label>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="secondary" onClick={() => setOpenModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Topik</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

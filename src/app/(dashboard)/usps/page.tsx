"use client"

import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { Textarea } from "@/components/Textarea"
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/Table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/Dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import React, { useEffect, useState } from "react"
import { fetchApi } from "@/lib/api"

interface USPItem {
  id: string
  title: string
  description: string
  sortOrder: number
  isActive: boolean
}

export default function USPsCMSPage() {
  const [usps, setUsps] = useState<USPItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<USPItem | null>(null)

  const [form, setForm] = useState({
    title: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  })

  const loadUSPs = async () => {
    try {
      const data = await fetchApi("/usps")
      setUsps(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUSPs()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setForm({
      title: "",
      description: "",
      sortOrder: usps.length,
      isActive: true,
    })
    setOpenModal(true)
  }

  const handleOpenEdit = (item: USPItem) => {
    setEditingItem(item)
    setForm({
      title: item.title,
      description: item.description,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    })
    setOpenModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await fetchApi(`/usps/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        })
      } else {
        await fetchApi("/usps", {
          method: "POST",
          body: JSON.stringify(form),
        })
      }
      setOpenModal(false)
      loadUSPs()
    } catch (err: any) {
      alert(`Gagal menyimpan USP: ${err.message}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus keunggulan (USP) ini?")) return
    try {
      await fetchApi(`/usps/${id}`, { method: "DELETE" })
      loadUSPs()
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
            Kelola Keunggulan (USP)
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Daftar nilai tambah & keunggulan tes bakat yang tampil di Halaman Utama & About Us
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 w-full sm:w-auto justify-center">
          <Plus className="size-4" />
          <span>Tambah USP</span>
        </Button>
      </div>

      <Card className="p-0 overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>No</TableHeaderCell>
              <TableHeaderCell>Judul Keunggulan</TableHeaderCell>
              <TableHeaderCell>Deskripsi Detail</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-sm text-gray-500">
                  Memuat data USP...
                </TableCell>
              </TableRow>
            ) : usps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-sm text-gray-500">
                  Belum ada item USP.
                </TableCell>
              </TableRow>
            ) : (
              usps.map((u, idx) => (
                <TableRow key={u.id}>
                  <TableCell className="text-xs text-gray-400 font-mono">#{idx + 1}</TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-gray-50">
                    {u.title}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 max-w-md">
                    {u.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? "success" : "warning"}>
                      {u.isActive ? "Aktif" : "Non-Aktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="secondary" className="p-1.5" onClick={() => handleOpenEdit(u)}>
                      <Edit className="size-4 text-gray-600" />
                    </Button>
                    <Button variant="secondary" className="p-1.5" onClick={() => handleDelete(u.id)}>
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit USP Keunggulan" : "Tambah USP Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Judul Keunggulan (USP Title)</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Menemukan Potensi Sejak Dini"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Deskripsi Explanatory</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Bukan sekadar anak pintar, tapi tahu pintar di bidang apa..."
                required
              />
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="secondary" onClick={() => setOpenModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan USP</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

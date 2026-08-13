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
import { Plus, Edit, Trash2, Sparkles } from "lucide-react"
import React, { useEffect, useState } from "react"
import { fetchApi } from "@/lib/api"

interface FeatureItem {
  id: string
  title: string
  description: string
  sortOrder: number
  isActive: boolean
}

export default function FeaturesCMSPage() {
  const [features, setFeatures] = useState<FeatureItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<FeatureItem | null>(null)

  // Confirm delete modal states
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  })

  const loadFeatures = async () => {
    try {
      const data = await fetchApi("/usps")
      setFeatures(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeatures()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setForm({
      title: "",
      description: "",
      sortOrder: features.length,
      isActive: true,
    })
    setOpenModal(true)
  }

  const handleOpenEdit = (item: FeatureItem) => {
    setEditingItem(item)
    setForm({
      title: item.title,
      description: item.description,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    })
    setOpenModal(true)
  }

  const handleToggleStatus = async (item: FeatureItem) => {
    try {
      await fetchApi(`/usps/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...item, isActive: !item.isActive }),
      })
      loadFeatures()
    } catch (err) {
      console.error(err)
    }
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
      loadFeatures()
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
      await fetchApi(`/usps/${deleteId}`, { method: "DELETE" })
      await loadFeatures()
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
            <Sparkles className="size-6 text-amber-500" />
            <span>Kelola Fitur &amp; Keunggulan Utama (Features)</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Kelola daftar fitur unggulan, kelebihan tes bakat, dan nilai tambah yang tampil di landing page
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 w-full sm:w-auto justify-center cursor-pointer">
          <Plus className="size-4" />
          <span>Tambah Fitur</span>
        </Button>
      </div>

      <Card className="p-0 overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>No</TableHeaderCell>
              <TableHeaderCell>Nama / Judul Fitur</TableHeaderCell>
              <TableHeaderCell>Deskripsi Detail</TableHeaderCell>
              <TableHeaderCell>Status (Klik Ubah)</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton columns={5} />
            ) : features.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-sm text-gray-500">
                  Belum ada data fitur unggulan.
                </TableCell>
              </TableRow>
            ) : (
              features.map((f, idx) => (
                <TableRow key={f.id}>
                  <TableCell className="text-xs text-gray-400 font-mono">#{idx + 1}</TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-gray-50">
                    {f.title}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 max-w-md">
                    {f.description}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleStatus(f)}
                      title="Klik untuk mengubah status"
                      className="cursor-pointer focus:outline-none"
                    >
                      <Badge variant={f.isActive ? "success" : "warning"}>
                        {f.isActive ? "Aktif" : "Non-Aktif"}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="secondary" className="p-1.5 cursor-pointer" onClick={() => handleOpenEdit(f)}>
                      <Edit className="size-4 text-gray-600" />
                    </Button>
                    <Button variant="secondary" className="p-1.5 cursor-pointer" onClick={() => promptDelete(f.id)}>
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
              {editingItem ? "Edit Fitur Unggulan" : "Tambah Fitur Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama / Judul Fitur (Feature Title)</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Menemukan Potensi Sejak Dini"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Deskripsi Fitur</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Bukan sekadar anak pintar, tapi tahu pintar di bidang apa..."
                required
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

            <DialogFooter className="mt-6">
              <Button type="button" variant="secondary" onClick={() => setOpenModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Fitur</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog Component */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus Fitur Unggulan?"
        description="Apakah Anda yakin ingin menghapus fitur unggulan ini?"
        confirmText="Hapus Fitur"
        loading={deleting}
        onConfirm={executeDelete}
      />
    </div>
  )
}

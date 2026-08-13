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
import { Plus, Edit, Trash2 } from "lucide-react"
import React, { useEffect, useState } from "react"
import { fetchApi } from "@/lib/api"

interface CommunityItem {
  id: string
  name: string
  href: string
  sortOrder: number
  isActive: boolean
}

export default function CommunitiesCMSPage() {
  const [communities, setCommunities] = useState<CommunityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<CommunityItem | null>(null)

  // Confirm delete modal states
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    name: "",
    href: "/community",
    sortOrder: 0,
    isActive: true,
  })

  const loadCommunities = async () => {
    try {
      const data = await fetchApi("/communities")
      setCommunities(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCommunities()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setForm({
      name: "",
      href: "/community",
      sortOrder: communities.length,
      isActive: true,
    })
    setOpenModal(true)
  }

  const handleOpenEdit = (item: CommunityItem) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      href: item.href,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    })
    setOpenModal(true)
  }

  const handleToggleStatus = async (item: CommunityItem) => {
    try {
      await fetchApi(`/communities/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...item, isActive: !item.isActive }),
      })
      loadCommunities()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await fetchApi(`/communities/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        })
      } else {
        await fetchApi("/communities", {
          method: "POST",
          body: JSON.stringify(form),
        })
      }
      setOpenModal(false)
      loadCommunities()
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
      await fetchApi(`/communities/${deleteId}`, { method: "DELETE" })
      await loadCommunities()
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
            Kelola Komunitas WhatsApp
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Link tautan grup WhatsApp komunitas yang tampil di halaman Komunitas &amp; Footer
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 w-full sm:w-auto justify-center cursor-pointer">
          <Plus className="size-4" />
          <span>Tambah Komunitas</span>
        </Button>
      </div>

      <Card className="p-0 overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Nama Komunitas</TableHeaderCell>
              <TableHeaderCell>Link Href / WhatsApp</TableHeaderCell>
              <TableHeaderCell>Status (Klik Ubah)</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton columns={4} />
            ) : communities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-sm text-gray-500">
                  Belum ada komunitas.
                </TableCell>
              </TableRow>
            ) : (
              communities.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold text-gray-900 dark:text-gray-50">
                    {c.name}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 font-mono">
                    {c.href}
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

      {/* Modal Form Dialog */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Komunitas" : "Tambah Komunitas Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Komunitas</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Komunitas Orang Tua JariBakat"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Link Href / URL</Label>
              <Input
                value={form.href}
                onChange={(e) => setForm({ ...form, href: e.target.value })}
                placeholder="/community atau https://wa.me/..."
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
              <Button type="submit">Simpan Komunitas</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog Component */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus Grup Komunitas?"
        description="Apakah Anda yakin ingin menghapus grup komunitas ini?"
        confirmText="Hapus Komunitas"
        loading={deleting}
        onConfirm={executeDelete}
      />
    </div>
  )
}

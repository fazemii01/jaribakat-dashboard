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

interface FAQItem {
  id: string
  category: string
  question: string
  answer: string
  sortOrder: number
  isActive: boolean
}

export default function FAQsCMSPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null)

  const [form, setForm] = useState({
    category: "Umum",
    question: "",
    answer: "",
    sortOrder: 0,
    isActive: true,
  })

  const loadFaqs = async () => {
    try {
      const data = await fetchApi("/faqs")
      setFaqs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFaqs()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setForm({
      category: "Umum",
      question: "",
      answer: "",
      sortOrder: faqs.length,
      isActive: true,
    })
    setOpenModal(true)
  }

  const handleOpenEdit = (item: FAQItem) => {
    setEditingItem(item)
    setForm({
      category: item.category,
      question: item.question,
      answer: item.answer,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    })
    setOpenModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await fetchApi(`/faqs/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        })
      } else {
        await fetchApi("/faqs", {
          method: "POST",
          body: JSON.stringify(form),
        })
      }
      setOpenModal(false)
      loadFaqs()
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus FAQ ini?")) return
    try {
      await fetchApi(`/faqs/${id}`, { method: "DELETE" })
      loadFaqs()
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
            Kelola FAQ Pusat Bantuan
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Daftar pertanyaan umum dan jawaban untuk halaman FAQ
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 w-full sm:w-auto justify-center">
          <Plus className="size-4" />
          <span>Tambah FAQ</span>
        </Button>
      </div>

      <Card className="p-0 overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Kategori</TableHeaderCell>
              <TableHeaderCell>Pertanyaan</TableHeaderCell>
              <TableHeaderCell>Jawaban</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-sm text-gray-500">
                  Memuat FAQs...
                </TableCell>
              </TableRow>
            ) : faqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-sm text-gray-500">
                  Belum ada FAQ.
                </TableCell>
              </TableRow>
            ) : (
              faqs.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <Badge variant="neutral">{f.category}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-gray-50 max-w-xs truncate">
                    {f.question}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 max-w-md truncate">
                    {f.answer}
                  </TableCell>
                  <TableCell>
                    <Badge variant={f.isActive ? "success" : "warning"}>
                      {f.isActive ? "Aktif" : "Non-Aktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="secondary" className="p-1.5" onClick={() => handleOpenEdit(f)}>
                      <Edit className="size-4 text-gray-600" />
                    </Button>
                    <Button variant="secondary" className="p-1.5" onClick={() => handleDelete(f.id)}>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit FAQ" : "Tambah FAQ Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Kategori FAQ</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Umum / Layanan / Manfaat / Paket"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Pertanyaan (Question)</Label>
              <Input
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="Apa itu JariBakat?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Jawaban (Answer)</Label>
              <Textarea
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="JariBakat adalah Platform..."
                rows={4}
                required
              />
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="secondary" onClick={() => setOpenModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan FAQ</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

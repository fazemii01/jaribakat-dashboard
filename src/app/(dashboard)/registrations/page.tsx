"use client"

import { Card } from "@/components/Card"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/Table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/Dialog"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { TableSkeleton } from "@/components/TableSkeleton"
import { Eye, Trash2, MessageCircle, Calendar, User, Phone, Mail, MapPin, CheckCircle, Clock } from "lucide-react"
import React, { useEffect, useState } from "react"
import { fetchApi } from "@/lib/api"

interface RegistrationItem {
  id: string
  name: string
  phone: string
  email: string
  city?: string
  role?: string
  participantAge?: string
  programType: string
  programTitle: string
  programId?: string
  notes?: string
  status: "pending" | "contacted" | "confirmed" | "cancelled"
  agreedToPolicy?: boolean
  createdAt: string
  updatedAt: string
}

export default function RegistrationsCMSPage() {
  const [items, setItems] = useState<RegistrationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedItem, setSelectedItem] = useState<RegistrationItem | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Confirm delete modal states
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadRegistrations = async () => {
    try {
      const data = await fetchApi("/registrations")
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRegistrations()
  }, [])

  const filteredItems = items.filter((item) => {
    if (statusFilter === "all") return true
    return item.status === statusFilter
  })

  const stats = {
    total: items.length,
    pending: items.filter((i) => i.status === "pending").length,
    contacted: items.filter((i) => i.status === "contacted").length,
    confirmed: items.filter((i) => i.status === "confirmed").length,
  }

  const handleOpenDetail = (item: RegistrationItem) => {
    setSelectedItem(item)
    setDetailModalOpen(true)
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingStatus(true)
    try {
      await fetchApi(`/registrations/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      })
      await loadRegistrations()
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem((prev) => prev ? { ...prev, status: newStatus as any } : null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingStatus(false)
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
      await fetchApi(`/registrations/${deleteId}`, { method: "DELETE" })
      await loadRegistrations()
      if (detailModalOpen && selectedItem?.id === deleteId) {
        setDetailModalOpen(false)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
      setDeleteId(null)
    }
  }

  // Format WhatsApp Link
  const getWhatsAppLink = (item: RegistrationItem) => {
    let cleanPhone = item.phone.replace(/[^0-9]/g, "")
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.substring(1)
    }
    const message = `Halo ${item.name}, terima kasih telah mendaftar di JariBakat untuk program *${item.programTitle}*. Kami dari tim konsultan JariBakat ingin mengonfirmasi pendaftaran Anda.`
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Menunggu Konfirmasi</Badge>
      case "contacted":
        return <Badge variant="neutral">Sudah Dihubungi</Badge>
      case "confirmed":
        return <Badge variant="success">Terkonfirmasi</Badge>
      case "cancelled":
        return <Badge variant="error">Dibatalkan</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
          Data Pendaftaran Formulir
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Daftar pemohon yang mengisi formulir pendaftaran di halaman landing page JariBakat
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-gray-500 font-medium">Total Pendaftaran</div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-50 mt-1">
            {stats.total}
          </div>
        </Card>
        <Card className="p-4 border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20">
          <div className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5">
            <Clock className="size-3.5" />
            <span>Menunggu Review</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-800 dark:text-amber-300 mt-1">
            {stats.pending}
          </div>
        </Card>
        <Card className="p-4 border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20">
          <div className="text-xs text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1.5">
            <MessageCircle className="size-3.5" />
            <span>Sudah Dihubungi</span>
          </div>
          <div className="text-2xl font-extrabold text-blue-800 dark:text-blue-300 mt-1">
            {stats.contacted}
          </div>
        </Card>
        <Card className="p-4 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20">
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
            <CheckCircle className="size-3.5" />
            <span>Terkonfirmasi</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300 mt-1">
            {stats.confirmed}
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pt-2 border-b border-gray-100 dark:border-gray-800 pb-3">
        {[
          { label: "Semua", value: "all", count: stats.total },
          { label: "Menunggu Review", value: "pending", count: stats.pending },
          { label: "Sudah Dihubungi", value: "contacted", count: stats.contacted },
          { label: "Terkonfirmasi", value: "confirmed", count: stats.confirmed },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === tab.value
                ? "bg-[#1E1B4B] text-white shadow-sm dark:bg-blue-600"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="p-0 overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Tanggal</TableHeaderCell>
              <TableHeaderCell>Nama Pendaftar</TableHeaderCell>
              <TableHeaderCell>Kontak WhatsApp / Email</TableHeaderCell>
              <TableHeaderCell>Program Dipilih</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton columns={6} />
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-sm text-gray-500">
                  Tidak ada data pendaftaran untuk filter ini.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-gray-50">
                    <div>{item.name}</div>
                    {item.role && (
                      <div className="text-[11px] text-gray-400 font-normal">{item.role}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Phone className="size-3" />
                      <span>{item.phone}</span>
                    </div>
                    <div className="text-gray-400 text-[11px] truncate max-w-[180px]">
                      {item.email}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="font-semibold text-xs text-gray-900 dark:text-gray-100 truncate">
                      {item.programTitle}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#0D9488] bg-[#CCFBF1] dark:bg-teal-950 dark:text-teal-400 px-1.5 py-0.5 rounded">
                      {item.programType}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(item.status)}
                  </TableCell>
                  <TableCell className="text-right space-x-1.5 whitespace-nowrap">
                    <a
                      href={getWhatsAppLink(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-1.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 transition-colors"
                      title="Hubungi via WhatsApp"
                    >
                      <MessageCircle className="size-4" />
                    </a>
                    <Button
                      variant="secondary"
                      className="p-1.5 cursor-pointer"
                      onClick={() => handleOpenDetail(item)}
                      title="Lihat Detail"
                    >
                      <Eye className="size-4 text-gray-600 dark:text-gray-300" />
                    </Button>
                    <Button
                      variant="secondary"
                      className="p-1.5 cursor-pointer"
                      onClick={() => promptDelete(item.id)}
                      title="Hapus"
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Detail Pendaftaran</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-5 py-3 text-sm">
              {/* Status Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <div>
                  <div className="text-xs text-gray-400">Status Saat Ini:</div>
                  <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Ubah Status:</span>
                  <select
                    value={selectedItem.status}
                    disabled={updatingStatus}
                    onChange={(e) => handleUpdateStatus(selectedItem.id, e.target.value)}
                    className="text-xs rounded-md border border-gray-300 bg-white dark:bg-gray-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="pending">Menunggu Review</option>
                    <option value="contacted">Sudah Dihubungi</option>
                    <option value="confirmed">Terkonfirmasi</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>
              </div>

              {/* Data Diri Grid */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">
                  Data Diri Pemohon
                </h4>
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                  <div className="flex items-start gap-2">
                    <User className="size-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-gray-400">Nama Lengkap</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{selectedItem.name}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="size-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-gray-400">No. WhatsApp</div>
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedItem.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="size-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-gray-400">Email</div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{selectedItem.email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="size-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-gray-400">Kota / Domisili</div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{selectedItem.city || "-"}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="size-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-gray-400">Peran / Usia Peserta</div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {selectedItem.role || "-"} {selectedItem.participantAge ? `(${selectedItem.participantAge})` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="size-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-gray-400">Persetujuan Kebijakan</div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {selectedItem.agreedToPolicy ? "Ya, Menyetujui" : "Tidak"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Program Dipilih */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">
                  Layanan / Program yang Diajukan
                </h4>
                <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-[#CCFBF1]/20 dark:bg-teal-950/20 space-y-1">
                  <div className="font-bold text-sm text-[#0F172A] dark:text-white">
                    {selectedItem.programTitle}
                  </div>
                  <div className="text-xs text-[#0D9488] font-semibold uppercase">
                    Kategori: {selectedItem.programType}
                  </div>
                </div>
              </div>

              {/* Catatan Tambahan */}
              {selectedItem.notes && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">
                    Catatan / Pertanyaan Pemohon
                  </h4>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 italic">
                    &quot;{selectedItem.notes}&quot;
                  </div>
                </div>
              )}

              {/* Action WhatsApp Button */}
              <div className="pt-2">
                <a
                  href={getWhatsAppLink(selectedItem)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="size-4" />
                  <span>Hubungi Pemohon via WhatsApp</span>
                </a>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDetailModalOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus Data Pendaftaran?"
        description="Apakah Anda yakin ingin menghapus data pendaftaran ini? Data yang dihapus tidak dapat dipulihkan."
        confirmText="Hapus Data"
        loading={deleting}
        onConfirm={executeDelete}
      />
    </div>
  )
}

"use client"

import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Button } from "@/components/Button"
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/Table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/Dialog"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import React, { useEffect, useState } from "react"
import { fetchApi } from "@/lib/api"

interface FooterLinkItem {
  id: string
  label: string
  href: string
  external: boolean
  sortOrder: number
}

interface FooterSectionItem {
  id: string
  title: string
  sortOrder: number
  links: FooterLinkItem[]
}

export default function FooterCMSPage() {
  const [sections, setSections] = useState<FooterSectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openSectionModal, setOpenSectionModal] = useState(false)
  const [editingSection, setEditingSection] = useState<FooterSectionItem | null>(null)
  const [sectionTitle, setSectionTitle] = useState("")

  const [openLinkModal, setOpenLinkModal] = useState(false)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [editingLink, setEditingLink] = useState<FooterLinkItem | null>(null)
  const [linkForm, setLinkForm] = useState({
    label: "",
    href: "",
    external: false,
    sortOrder: 0,
  })

  // Confirm delete modal states
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: "section" | "link"; id: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadFooter = async () => {
    try {
      const data = await fetchApi("/footer")
      setSections(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFooter()
  }, [])

  // Section handlers
  const handleOpenCreateSection = () => {
    setEditingSection(null)
    setSectionTitle("")
    setOpenSectionModal(true)
  }

  const handleOpenEditSection = (sec: FooterSectionItem) => {
    setEditingSection(sec)
    setSectionTitle(sec.title)
    setOpenSectionModal(true)
  }

  const handleSubmitSection = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingSection) {
        await fetchApi(`/footer/sections/${editingSection.id}`, {
          method: "PUT",
          body: JSON.stringify({ title: sectionTitle }),
        })
      } else {
        await fetchApi("/footer/sections", {
          method: "POST",
          body: JSON.stringify({ title: sectionTitle, sortOrder: sections.length }),
        })
      }
      setOpenSectionModal(false)
      loadFooter()
    } catch (err: any) {
      console.error(err)
    }
  }

  const promptDeleteSection = (id: string) => {
    setDeleteTarget({ type: "section", id })
    setConfirmOpen(true)
  }

  // Link handlers
  const handleOpenCreateLink = (sectionId: string) => {
    setActiveSectionId(sectionId)
    setEditingLink(null)
    setLinkForm({ label: "", href: "/", external: false, sortOrder: 0 })
    setOpenLinkModal(true)
  }

  const handleOpenEditLink = (sectionId: string, link: FooterLinkItem) => {
    setActiveSectionId(sectionId)
    setEditingLink(link)
    setLinkForm({ label: link.label, href: link.href, external: link.external, sortOrder: link.sortOrder })
    setOpenLinkModal(true)
  }

  const handleSubmitLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSectionId) return
    try {
      if (editingLink) {
        await fetchApi(`/footer/links/${editingLink.id}`, {
          method: "PUT",
          body: JSON.stringify(linkForm),
        })
      } else {
        await fetchApi(`/footer/sections/${activeSectionId}/links`, {
          method: "POST",
          body: JSON.stringify(linkForm),
        })
      }
      setOpenLinkModal(false)
      loadFooter()
    } catch (err: any) {
      console.error(err)
    }
  }

  const promptDeleteLink = (id: string) => {
    setDeleteTarget({ type: "link", id })
    setConfirmOpen(true)
  }

  const executeDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      if (deleteTarget.type === "section") {
        await fetchApi(`/footer/sections/${deleteTarget.id}`, { method: "DELETE" })
      } else {
        await fetchApi(`/footer/links/${deleteTarget.id}`, { method: "DELETE" })
      }
      await loadFooter()
    } catch (err: any) {
      console.error(err)
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
            Kelola Footer Links &amp; Seksi
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Atur kolom footer, menu tautan, dan link eksternal landing page
          </p>
        </div>
        <Button onClick={handleOpenCreateSection} className="gap-2 w-full sm:w-auto justify-center cursor-pointer">
          <Plus className="size-4" />
          <span>Tambah Kolom Footer</span>
        </Button>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-sm text-gray-500">Memuat seksi footer...</Card>
      ) : sections.length === 0 ? (
        <Card className="p-8 text-center text-sm text-gray-500">Belum ada kolom footer disetup.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((sec) => (
            <Card key={sec.id} className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-50">
                  {sec.title}
                </h3>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" className="p-1 cursor-pointer" onClick={() => handleOpenEditSection(sec)}>
                    <Edit className="size-4 text-gray-600" />
                  </Button>
                  <Button variant="ghost" className="p-1 cursor-pointer" onClick={() => promptDeleteSection(sec.id)}>
                    <Trash2 className="size-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Label Link</TableHeaderCell>
                      <TableHeaderCell>URL / Href</TableHeaderCell>
                      <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sec.links && sec.links.length > 0 ? (
                      sec.links.map((lnk) => (
                        <TableRow key={lnk.id}>
                          <TableCell className="font-medium text-xs text-gray-900 dark:text-gray-100">
                            {lnk.label}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500 max-w-[120px] truncate font-mono">
                            {lnk.href}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="secondary" className="p-1 text-xs cursor-pointer" onClick={() => handleOpenEditLink(sec.id, lnk)}>
                              <Edit className="size-3 text-gray-600" />
                            </Button>
                            <Button variant="secondary" className="p-1 text-xs cursor-pointer" onClick={() => promptDeleteLink(lnk.id)}>
                              <Trash2 className="size-3 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-xs text-gray-400">
                          Belum ada link di kolom ini.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <Button variant="secondary" className="w-full text-xs gap-1 mt-2 cursor-pointer" onClick={() => handleOpenCreateLink(sec.id)}>
                  <Plus className="size-3" />
                  <span>Tambah Link Ke Kolom Ini</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Section Dialog */}
      <Dialog open={openSectionModal} onOpenChange={setOpenSectionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSection ? "Edit Kolom Footer" : "Tambah Kolom Footer Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitSection} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Judul Kolom / Seksi Footer</Label>
              <Input
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="Kenali JariBakat / Layanan Bakat"
                required
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="secondary" onClick={() => setOpenSectionModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Kolom</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={openLinkModal} onOpenChange={setOpenLinkModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLink ? "Edit Link Footer" : "Tambah Link Footer Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitLink} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Label Teks Link</Label>
              <Input
                value={linkForm.label}
                onChange={(e) => setLinkForm({ ...linkForm, label: e.target.value })}
                placeholder="Tentang JariBakat"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Target URL / Href</Label>
              <Input
                value={linkForm.href}
                onChange={(e) => setLinkForm({ ...linkForm, href: e.target.value })}
                placeholder="/about-us"
                required
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="ext"
                checked={linkForm.external}
                onChange={(e) => setLinkForm({ ...linkForm, external: e.target.checked })}
                className="rounded border-gray-300 cursor-pointer"
              />
              <Label htmlFor="ext" className="text-xs cursor-pointer">Buka di Tab Baru (External Link)</Label>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="secondary" onClick={() => setOpenLinkModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Link</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog Component */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={deleteTarget?.type === "section" ? "Hapus Kolom Footer?" : "Hapus Link Footer?"}
        description={
          deleteTarget?.type === "section"
            ? "Apakah Anda yakin ingin menghapus kolom footer ini beserta seluruh link di dalamnya?"
            : "Apakah Anda yakin ingin menghapus tautan link ini dari footer?"
        }
        confirmText="Hapus"
        loading={deleting}
        onConfirm={executeDelete}
      />
    </div>
  )
}

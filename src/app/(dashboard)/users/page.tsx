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
import { UserPlus, Edit, Trash2, ShieldCheck, UserCheck } from "lucide-react"
import React, { useEffect, useState } from "react"
import { fetchApi } from "@/lib/api"

interface UserItem {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function UsersCMSPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<UserItem | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  // Confirm delete modal states
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  })

  const loadUsers = async () => {
    try {
      const data = await fetchApi("/users")
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data)
      } else {
        // Fallback: Populate active logged-in admin user profile if backend list is empty
        try {
          const profile = await fetchApi("/auth/profile")
          if (profile && profile.email) {
            setUsers([
              {
                id: profile.id || "1",
                name: profile.name || "Admin JariBakat",
                email: profile.email,
                role: profile.role || "admin",
                createdAt: profile.createdAt || new Date().toISOString(),
              },
            ])
          } else {
            setUsers([])
          }
        } catch {
          setUsers([])
        }
      }
    } catch (err) {
      console.error(err)
      try {
        const profile = await fetchApi("/auth/profile")
        if (profile && profile.email) {
          setUsers([
            {
              id: profile.id || "1",
              name: profile.name || "Admin JariBakat",
              email: profile.email,
              role: profile.role || "admin",
              createdAt: profile.createdAt || new Date().toISOString(),
            },
          ])
        }
      } catch {}
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setErrorMsg("")
    setForm({
      name: "",
      email: "",
      password: "",
      role: "admin",
    })
    setOpenModal(true)
  }

  const handleOpenEdit = (item: UserItem) => {
    setEditingItem(item)
    setErrorMsg("")
    setForm({
      name: item.name,
      email: item.email,
      password: "", // Optional for update
      role: item.role,
    })
    setOpenModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    try {
      if (editingItem) {
        const payload: Record<string, any> = {
          name: form.name,
          email: form.email,
          role: form.role,
        }
        if (form.password && form.password.trim().length > 0) {
          payload.password = form.password
        }
        await fetchApi(`/users/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      } else {
        await fetchApi("/users", {
          method: "POST",
          body: JSON.stringify(form),
        })
      }
      setOpenModal(false)
      loadUsers()
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan data pengguna")
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
      await fetchApi(`/users/${deleteId}`, { method: "DELETE" })
      await loadUsers()
    } catch (err: any) {
      alert(err.message || "Gagal menghapus pengguna")
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
            <ShieldCheck className="size-6 text-indigo-600 dark:text-indigo-400" />
            <span>Kelola Pengguna Admin &amp; Akses Dashboard</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Kelola akun administrator, staf, dan hak akses otentikasi login ke Dashboard CMS JariBakat
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 w-full sm:w-auto justify-center cursor-pointer">
          <UserPlus className="size-4" />
          <span>Tambah Admin Baru</span>
        </Button>
      </div>

      <Card className="p-0 overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>No</TableHeaderCell>
              <TableHeaderCell>Nama Lengkap</TableHeaderCell>
              <TableHeaderCell>Email Pengguna</TableHeaderCell>
              <TableHeaderCell>Hak Akses / Role</TableHeaderCell>
              <TableHeaderCell>Tanggal Dibuat</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton columns={6} />
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-sm text-gray-500">
                  Belum ada data pengguna admin.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u, idx) => (
                <TableRow key={u.id}>
                  <TableCell className="text-xs text-gray-400 font-mono">#{idx + 1}</TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                    <UserCheck className="size-4 text-blue-500 shrink-0" />
                    <span>{u.name}</span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600 dark:text-gray-300 font-mono">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "success" : "neutral"} className="uppercase text-[10px] font-bold">
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="secondary" className="p-1.5 cursor-pointer" onClick={() => handleOpenEdit(u)}>
                      <Edit className="size-4 text-gray-600" />
                    </Button>
                    <Button variant="secondary" className="p-1.5 cursor-pointer" onClick={() => promptDelete(u.id)}>
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
              {editingItem ? "Edit Pengguna Admin" : "Tambah Admin Baru"}
            </DialogTitle>
          </DialogHeader>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="mis. Admin JariBakat"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Email Akun Login</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@jaribakat.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>
                {editingItem ? "Kata Sandi Baru (Kosongkan jika tidak diubah)" : "Kata Sandi (Password)"}
              </Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editingItem ? "Minimal 6 karakter" : "Minimal 6 karakter"}
                required={!editingItem}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label>Hak Akses (Role)</Label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
              >
                <option value="admin">Admin (Akses Penuh Dashboard CMS)</option>
                <option value="user">User / Member (Akses Terbatas)</option>
              </select>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="secondary" onClick={() => setOpenModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Pengguna</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog Component */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus Akun Pengguna?"
        description="Apakah Anda yakin ingin menghapus akses akun admin ini dari sistem?"
        confirmText="Hapus Pengguna"
        loading={deleting}
        onConfirm={executeDelete}
      />
    </div>
  )
}

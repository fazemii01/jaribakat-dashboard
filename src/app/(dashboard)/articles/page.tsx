"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  BookOpen,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react"
import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/Table"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { TableSkeleton } from "@/components/TableSkeleton"
import { fetchApi } from "@/lib/api"

interface ArticleItem {
  id: string
  title: string
  slug: string
  category: string
  coverImage?: string
  status: "draft" | "published"
  views: number
  readingTime: string
  publishedAt?: string
  createdAt: string
}

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadArticles = async () => {
    try {
      setLoading(true)
      const data = await fetchApi("/articles")
      setArticles(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Gagal memuat artikel:", err)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArticles()
  }, [])

  const handleDelete = async () => {
    if (!selectedArticle) return
    try {
      setDeleting(true)
      await fetchApi(`/articles/${selectedArticle.id}`, { method: "DELETE" })
      setArticles((prev) => prev.filter((a) => a.id !== selectedArticle.id))
      setDeleteOpen(false)
      setSelectedArticle(null)
    } catch (err: any) {
      alert(`Gagal menghapus artikel: ${err.message || "Terjadi kesalahan"}`)
    } finally {
      setDeleting(false)
    }
  }

  const toggleStatus = async (item: ArticleItem) => {
    const newStatus = item.status === "published" ? "draft" : "published"
    try {
      await fetchApi(`/articles/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      })
      setArticles((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, status: newStatus } : a))
      )
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message || "Terjadi kesalahan"}`)
    }
  }

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.slug.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ? true : a.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
            Artikel & Konten Edukasi
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola publikasi wawasan seputar tes bakat, sidik jari, dan pola asuh anak.
          </p>
        </div>
        <Link href="/articles/builder">
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4" />
            <span>Buat Konten Baru</span>
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari judul atau topik..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="published">Diterbitkan (Published)</option>
              <option value="draft">Draf (Draft)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Articles Table */}
      <Card className="overflow-hidden border-gray-200 dark:border-gray-800 p-0">
        {loading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : filteredArticles.length === 0 ? (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400">
            <BookOpen className="w-12 h-12 stroke-[1.2] mx-auto mb-3 text-gray-400" />
            <p className="text-base font-medium">Belum ada artikel yang sesuai.</p>
            <p className="text-xs text-gray-400 mt-1">
              Klik &quot;Buat Konten Baru&quot; untuk menyusun artikel pertama Anda dengan builder interaktif.
            </p>
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow className="border-b border-gray-200 dark:border-gray-800">
                <TableHeaderCell>Artikel</TableHeaderCell>
                <TableHeaderCell>Kategori</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Pembaca</TableHeaderCell>
                <TableHeaderCell>Tanggal</TableHeaderCell>
                <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredArticles.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="w-14 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-800 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-gray-400">
                          <BookOpen className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/articles/builder?id=${item.id}`}
                          className="font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-gray-400 font-mono line-clamp-1">
                          /{item.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="neutral" className="text-xs">
                      {item.category}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <button
                      onClick={() => toggleStatus(item)}
                      title="Klik untuk mengubah status"
                      className="cursor-pointer"
                    >
                      {item.status === "published" ? (
                        <Badge variant="success" className="gap-1 text-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Diterbitkan</span>
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="gap-1 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>Draf</span>
                        </Badge>
                      )}
                    </button>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{item.views || 0} tayangan</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(item.publishedAt || item.createdAt))}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status === "published" && (
                        <a
                          href={`http://localhost:9009/article/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="Lihat Halaman Publik"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <Link
                        href={`/articles/builder?id=${item.id}`}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Edit di Builder"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedArticle(item)
                          setDeleteOpen(true)
                        }}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Hapus Artikel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Artikel"
        description={`Apakah Anda yakin ingin menghapus artikel "${selectedArticle?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Sekarang"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}

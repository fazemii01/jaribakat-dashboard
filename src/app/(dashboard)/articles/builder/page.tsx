"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Bookmark,
  Send,
  UploadCloud,
  Type,
  Heading2,
  Image as ImageIcon,
  Quote,
  Trash2,
  ArrowUp,
  ArrowDown,
  BookOpen,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react"
import { fetchApi, uploadFileApi } from "@/lib/api"

export interface ContentBlock {
  id: string
  type: "paragraph" | "heading" | "image" | "quote"
  content: string
  url?: string
  caption?: string
  author?: string
}

const CATEGORIES = [
  "Artikel & Edukasi",
  "Parenting & Edukasi",
  "Tes Bakat & Minat",
  "Gaya Belajar Anak",
  "Analisis Sidik Jari",
  "Tips Karir & Remaja",
  "Tumbuh Kembang & Emosi",
]

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function calculateReadingTime(blocks: ContentBlock[]): string {
  const text = blocks
    .map((b) => `${b.content || ""} ${b.caption || ""} ${b.author || ""}`)
    .join(" ")
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const minutes = Math.max(1, Math.ceil(wordCount / 180))
  return `${minutes} menit baca`
}

function ArticleBuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const articleId = searchParams.get("id")

  const [loading, setLoading] = useState(!!articleId)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const coverInputRef = useRef<HTMLInputElement>(null)
  const blockImageInputRef = useRef<HTMLInputElement>(null)
  const [activeUploadingBlockId, setActiveUploadingBlockId] = useState<string | null>(null)

  // Article state
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [isSlugManual, setIsSlugManual] = useState(false)
  const [category, setCategory] = useState("Artikel & Edukasi")
  const [coverImage, setCoverImage] = useState("")
  const [status, setStatus] = useState<"draft" | "published">("published")
  const [blocks, setBlocks] = useState<ContentBlock[]>([
    {
      id: "block-1",
      type: "paragraph",
      content: "",
    },
  ])

  // Load existing article if editing
  useEffect(() => {
    if (!articleId) return

    async function loadArticle() {
      try {
        setLoading(true)
        const data = await fetchApi(`/articles/${articleId}`)
        if (data) {
          setTitle(data.title || "")
          setSlug(data.slug || "")
          setIsSlugManual(true)
          setCategory(data.category || "Artikel & Edukasi")
          setCoverImage(data.coverImage || "")
          setStatus(data.status || "published")

          if (data.contentBlocks) {
            try {
              const parsed =
                typeof data.contentBlocks === "string"
                  ? JSON.parse(data.contentBlocks)
                  : data.contentBlocks
              if (Array.isArray(parsed) && parsed.length > 0) {
                setBlocks(parsed)
              }
            } catch (e) {
              setBlocks([
                {
                  id: "block-1",
                  type: "paragraph",
                  content: String(data.contentBlocks),
                },
              ])
            }
          }
        }
      } catch (err: any) {
        setStatusMessage({
          type: "error",
          text: `Gagal memuat artikel: ${err.message || "Terjadi kesalahan"}`,
        })
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [articleId])

  // Auto update slug when title changes unless manually edited
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!isSlugManual) {
      setSlug(generateSlug(val))
    }
  }

  // Cover image upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingCover(true)
      const res = await uploadFileApi(file)
      if (res && res.url) {
        setCoverImage(res.url)
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: `Gagal mengunggah cover: ${err.message || "Terjadi kesalahan"}`,
      })
    } finally {
      setUploadingCover(false)
      if (coverInputRef.current) coverInputRef.current.value = ""
    }
  }

  // Block handlers
  const addBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      content: "",
      caption: "",
      author: "",
      url: "",
    }
    setBlocks([...blocks, newBlock])
  }

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)))
  }

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) {
      setBlocks([{ id: `block-${Date.now()}`, type: "paragraph", content: "" }])
      return
    }
    setBlocks(blocks.filter((b) => b.id !== id))
  }

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1
    if (newIdx < 0 || newIdx >= blocks.length) return
    const reordered = [...blocks]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(newIdx, 0, moved)
    setBlocks(reordered)
  }

  // Upload image inside a block
  const handleBlockImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeUploadingBlockId) return

    try {
      setSaving(true)
      const res = await uploadFileApi(file)
      if (res && res.url) {
        updateBlock(activeUploadingBlockId, { url: res.url })
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: `Gagal mengunggah gambar blok: ${err.message || "Terjadi kesalahan"}`,
      })
    } finally {
      setSaving(false)
      setActiveUploadingBlockId(null)
      if (blockImageInputRef.current) blockImageInputRef.current.value = ""
    }
  }

  // Save or Publish
  const handleSave = async (targetStatus: "draft" | "published") => {
    if (!title.trim()) {
      setStatusMessage({
        type: "error",
        text: "Judul artikel wajib diisi terlebih dahulu.",
      })
      return
    }

    try {
      setSaving(true)
      setStatusMessage(null)

      const readingTime = calculateReadingTime(blocks)
      const excerpt =
        blocks.find((b) => b.type === "paragraph" && b.content.trim())?.content.slice(0, 160) || ""

      const payload = {
        title: title.trim(),
        slug: slug.trim() || generateSlug(title),
        category,
        coverImage: coverImage || null,
        excerpt,
        contentBlocks: blocks,
        author: "Tim Analis JariBakat",
        authorRole: "Senior Fingerprint & Parenting Consultant",
        readingTime,
        status: targetStatus || status,
      }

      if (articleId) {
        await fetchApi(`/articles/${articleId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
        setStatus(targetStatus)
        setStatusMessage({
          type: "success",
          text: targetStatus === "published" ? "Artikel berhasil diterbitkan!" : "Draf artikel berhasil disimpan!",
        })
      } else {
        const created = await fetchApi("/articles", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        setStatus(targetStatus)
        setStatusMessage({
          type: "success",
          text: targetStatus === "published" ? "Artikel baru berhasil diterbitkan!" : "Draf baru berhasil disimpan!",
        })
        if (created && created.id) {
          router.replace(`/articles/builder?id=${created.id}`)
        }
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: `Gagal menyimpan: ${err.message || "Terjadi kesalahan"}`,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-gray-200 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm text-gray-400">Memuat artikel builder...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-gray-100 flex flex-col font-sans -m-4 sm:-m-6 lg:-m-8">
      {/* Hidden file inputs */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverUpload}
      />
      <input
        ref={blockImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBlockImageUpload}
      />

      {/* TOP BAR */}
      <header className="sticky top-0 z-40 bg-[#0C1222] border-b border-[#1A2338] px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/articles"
            className="p-2 rounded-lg bg-[#141C30] hover:bg-[#1E2945] text-gray-300 hover:text-white transition-colors border border-[#1E2945] shrink-0"
            title="Kembali ke Daftar Artikel"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {articleId ? "Edit Konten" : "Buat Konten Baru"}
              </h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  status === "published"
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                    : "bg-amber-950/80 text-amber-300 border border-amber-800"
                }`}
              >
                {status === "published" ? "Published" : "Draft"}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono truncate">
              {slug ? `/${slug}` : "belum-ada-slug"}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141C30] hover:bg-[#1E2945] text-gray-300 text-xs sm:text-sm font-medium border border-[#1E2945] transition-colors"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4 text-gray-400" />
                <span>Sembunyikan Preview</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-gray-400" />
                <span>Tampilkan Preview</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave("draft")}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#141C30] hover:bg-[#1E2945] text-gray-200 text-xs sm:text-sm font-semibold border border-[#2A3756] transition-colors disabled:opacity-50"
          >
            <Bookmark className="w-4 h-4 text-gray-300" />
            <span>Simpan Draft</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave("published")}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg bg-white hover:bg-gray-100 text-[#070B14] text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#070B14]" />
            ) : (
              <Send className="w-4 h-4 text-[#070B14]" />
            )}
            <span>Terbitkan</span>
          </button>
        </div>
      </header>

      {/* ALERT BANNER */}
      {statusMessage && (
        <div
          className={`px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-medium ${
            statusMessage.type === "success"
              ? "bg-emerald-950/80 text-emerald-200 border-b border-emerald-800"
              : "bg-rose-950/80 text-rose-200 border-b border-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="p-1 hover:opacity-75"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* MAIN BUILDER BODY (2-COLUMN GRID) */}
      <div className="flex-1 p-4 lg:p-8 max-w-[1700px] w-full mx-auto">
        <div className={`grid grid-cols-1 ${showPreview ? "lg:grid-cols-12 gap-8" : "gap-8"}`}>
          {/* LEFT COLUMN: BUILDER FORM */}
          <div className={`${showPreview ? "lg:col-span-7 xl:col-span-7" : "max-w-4xl mx-auto w-full"} space-y-6`}>
            {/* Top Row: Cover & Meta Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* GAMBAR COVER */}
              <div>
                <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
                  Gambar Cover
                </label>
                {coverImage ? (
                  <div className="relative group rounded-xl overflow-hidden border border-[#1E2945] bg-[#0E1528] aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage}
                      alt="Cover artikel"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-gray-900 rounded-md text-xs font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Ganti Cover
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverImage("")}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-md text-xs font-semibold hover:bg-rose-700 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="w-full aspect-video rounded-xl border border-dashed border-[#243356] hover:border-amber-500/60 bg-[#0C1222] hover:bg-[#0F172C] transition-all flex flex-col items-center justify-center p-4 text-center group cursor-pointer"
                  >
                    {uploadingCover ? (
                      <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-2" />
                    ) : (
                      <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-amber-400 transition-colors mb-2" />
                    )}
                    <span className="text-xs sm:text-sm font-semibold text-gray-200 group-hover:text-white">
                      Unggah cover artikel
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">
                      Rasio disarankan 16:9
                    </span>
                  </button>
                )}
              </div>

              {/* KATEGORI & SLUG */}
              <div className="space-y-4">
                {/* KATEGORI KONTEN */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
                    Kategori Konten
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C1222] border border-[#1E2945] text-white text-sm focus:outline-none focus:border-amber-500 transition-colors font-medium"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0C1222] text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* JUDUL KONTEN */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
                    Judul Konten
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Contoh: Mengatasi Speech Delay Sejak Dini"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C1222] border border-[#1E2945] text-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                {/* SLUG URL */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
                    Slug URL
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setIsSlugManual(true)
                      setSlug(generateSlug(e.target.value))
                    }}
                    placeholder="mengatasi-speech-delay"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C1222] border border-[#1E2945] text-gray-300 font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* DAFTAR BLOK ARTIKEL SECTION */}
            <div className="pt-4 border-t border-[#162036] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                  Daftar Blok Artikel
                </h3>
                <span className="text-xs text-gray-400 font-medium">
                  {blocks.length} blok terbuat
                </span>
              </div>

              {/* LIST OF BLOCKS */}
              <div className="space-y-3.5">
                {blocks.map((block, idx) => (
                  <div
                    key={block.id}
                    className="rounded-xl border border-[#1A253F] bg-[#0A101F] overflow-hidden transition-all hover:border-[#26375E] group"
                  >
                    {/* Block Header */}
                    <div className="px-3.5 py-2 bg-[#0E1528] border-b border-[#1A253F] flex items-center justify-between gap-2">
                      {/* Block Type Badge */}
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase bg-[#162038] text-gray-300 border border-[#253457]">
                          {block.type === "paragraph" && (
                            <>
                              <Type className="w-3 h-3 text-amber-400" />
                              <span>Paragraf</span>
                            </>
                          )}
                          {block.type === "heading" && (
                            <>
                              <Heading2 className="w-3 h-3 text-indigo-400" />
                              <span>Sub-Judul</span>
                            </>
                          )}
                          {block.type === "image" && (
                            <>
                              <ImageIcon className="w-3 h-3 text-emerald-400" />
                              <span>Gambar</span>
                            </>
                          )}
                          {block.type === "quote" && (
                            <>
                              <Quote className="w-3 h-3 text-cyan-400" />
                              <span>Kutipan</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Block Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveBlock(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1A253F] disabled:opacity-25 transition-colors"
                          title="Pindah ke Atas"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlock(idx, "down")}
                          disabled={idx === blocks.length - 1}
                          className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1A253F] disabled:opacity-25 transition-colors"
                          title="Pindah ke Bawah"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBlock(block.id)}
                          className="p-1 rounded text-gray-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors ml-1"
                          title="Hapus Blok"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Block Content Editor */}
                    <div className="p-3.5">
                      {block.type === "paragraph" && (
                        <textarea
                          rows={4}
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          placeholder="Tulis isi paragraf di sini..."
                          className="w-full bg-transparent text-sm text-gray-200 placeholder:text-gray-400 focus:outline-none resize-y leading-relaxed"
                        />
                      )}

                      {block.type === "heading" && (
                        <input
                          type="text"
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          placeholder="Tulis sub-judul artikel..."
                          className="w-full bg-transparent text-base font-bold text-white placeholder:text-gray-400 focus:outline-none"
                        />
                      )}

                      {block.type === "image" && (
                        <div className="space-y-3">
                          {block.url ? (
                            <div className="relative group/img rounded-lg overflow-hidden border border-[#1E2945] bg-[#0E1528] max-h-[260px] flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={block.url}
                                alt={block.caption || "Gambar konten"}
                                className="max-h-[260px] w-full object-contain"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveUploadingBlockId(block.id)
                                    blockImageInputRef.current?.click()
                                  }}
                                  className="px-3 py-1 bg-white text-gray-900 rounded text-xs font-semibold hover:bg-gray-200"
                                >
                                  Ganti Gambar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateBlock(block.id, { url: "" })}
                                  className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700"
                                >
                                  Hapus Gambar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveUploadingBlockId(block.id)
                                  blockImageInputRef.current?.click()
                                }}
                                className="flex-1 py-3 px-4 rounded-lg border border-dashed border-[#243356] hover:border-amber-500/60 bg-[#0E1528] text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                              >
                                <UploadCloud className="w-4 h-4 text-amber-400" />
                                <span>Unggah File Gambar</span>
                              </button>
                              <input
                                type="text"
                                placeholder="Atau tempel URL gambar..."
                                value={block.content || ""}
                                onChange={(e) =>
                                  updateBlock(block.id, {
                                    url: e.target.value,
                                    content: e.target.value,
                                  })
                                }
                                className="flex-1 px-3 py-2 rounded-lg bg-[#0E1528] border border-[#1E2945] text-xs text-gray-300 placeholder:text-gray-400 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          )}
                          <input
                            type="text"
                            value={block.caption || ""}
                            onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                            placeholder="Keterangan / Caption gambar (opsional)..."
                            className="w-full px-3 py-1.5 rounded-lg bg-[#0E1528] border border-[#1E2945] text-xs text-gray-300 placeholder:text-gray-400 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      )}

                      {block.type === "quote" && (
                        <div className="space-y-2.5">
                          <textarea
                            rows={2}
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            placeholder="Tulis kutipan penting atau statement narasumber..."
                            className="w-full bg-transparent text-sm italic text-gray-200 placeholder:text-gray-400 focus:outline-none resize-y"
                          />
                          <input
                            type="text"
                            value={block.author || ""}
                            onChange={(e) => updateBlock(block.id, { author: e.target.value })}
                            placeholder="Nama tokoh / sumber kutipan (opsional)..."
                            className="w-full px-3 py-1.5 rounded-lg bg-[#0E1528] border border-[#1E2945] text-xs text-gray-300 placeholder:text-gray-400 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* TAMBAH BLOK BUTTONS */}
              <div className="pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 tracking-wider uppercase mr-1">
                    Tambah Blok:
                  </span>
                  <button
                    type="button"
                    onClick={() => addBlock("paragraph")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111A30] hover:bg-[#1A2645] text-gray-200 hover:text-white border border-[#223258] text-xs font-semibold transition-colors"
                  >
                    <Type className="w-3.5 h-3.5 text-amber-400" />
                    <span>Paragraf</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock("heading")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111A30] hover:bg-[#1A2645] text-gray-200 hover:text-white border border-[#223258] text-xs font-semibold transition-colors"
                  >
                    <Heading2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Sub-Judul</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock("image")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111A30] hover:bg-[#1A2645] text-gray-200 hover:text-white border border-[#223258] text-xs font-semibold transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Gambar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock("quote")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111A30] hover:bg-[#1A2645] text-gray-200 hover:text-white border border-[#223258] text-xs font-semibold transition-colors"
                  >
                    <Quote className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Kutipan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: LIVE PREVIEW */}
          {showPreview && (
            <div className="lg:col-span-5 xl:col-span-5">
              <div className="sticky top-20">
                <div className="rounded-2xl border border-[#1E2945] bg-[#0A101F] shadow-2xl overflow-hidden">
                  {/* Preview Top Cover */}
                  {coverImage ? (
                    <div className="aspect-video w-full overflow-hidden bg-black/40 border-b border-[#1E2945]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverImage}
                        alt="Preview cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-[#0E1528] border-b border-[#1E2945] flex flex-col items-center justify-center p-6 text-center text-gray-400">
                      <BookOpen className="w-10 h-10 stroke-[1.2] mb-2 text-gray-400" />
                      <span className="text-xs sm:text-sm font-medium">
                        Gambar Cover Belum Diunggah
                      </span>
                    </div>
                  )}

                  {/* Preview Article Content */}
                  <div className="p-6 sm:p-7 space-y-4">
                    {/* Category Pill */}
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#141C30] text-gray-300 border border-[#223052]">
                        {category}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                      {title.trim() || "Judul Artikel Anda Akan Tampil Di Sini"}
                    </h2>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>
                        Dipublikasikan:{" "}
                        {new Intl.DateTimeFormat("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(new Date())}
                      </span>
                      <span>•</span>
                      <span>{calculateReadingTime(blocks)}</span>
                    </div>

                    <hr className="border-[#1E2945] my-4" />

                    {/* Blocks Stream */}
                    <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
                      {blocks.every((b) => !b.content && !b.url) ? (
                        <p className="text-xs text-gray-400 italic">
                          Ketuk blok untuk mengedit tulisan paragraf...
                        </p>
                      ) : (
                        blocks.map((block) => (
                          <div key={block.id}>
                            {block.type === "paragraph" && block.content && (
                              <p className="whitespace-pre-line text-gray-300 text-[13px] sm:text-sm leading-relaxed">
                                {block.content}
                              </p>
                            )}

                            {block.type === "heading" && block.content && (
                              <h3 className="text-base sm:text-lg font-bold text-white pt-2">
                                {block.content}
                              </h3>
                            )}

                            {block.type === "image" && (block.url || block.content) && (
                              <figure className="my-3 rounded-lg overflow-hidden bg-[#070B14] border border-[#1E2945]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={block.url || block.content}
                                  alt={block.caption || "Ilustrasi artikel"}
                                  className="w-full max-h-56 object-cover"
                                />
                                {block.caption && (
                                  <figcaption className="p-2 text-center text-[11px] text-gray-400 italic bg-[#0B1120]">
                                    {block.caption}
                                  </figcaption>
                                )}
                              </figure>
                            )}

                            {block.type === "quote" && block.content && (
                              <blockquote className="my-3 pl-4 py-2 border-l-2 border-amber-400 bg-amber-950/20 rounded-r-lg italic text-amber-100 text-xs sm:text-sm">
                                &ldquo;{block.content}&rdquo;
                                {block.author && (
                                  <cite className="block text-[11px] not-italic text-amber-300 font-semibold mt-1">
                                    — {block.author}
                                  </cite>
                                )}
                              </blockquote>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ArticleBuilderPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
          <p className="text-sm">Memuat artikel builder...</p>
        </div>
      }
    >
      <ArticleBuilderContent />
    </React.Suspense>
  )
}

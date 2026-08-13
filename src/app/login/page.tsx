"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi, setAuthToken } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!data.accessToken) {
        throw new Error("Login gagal: Token tidak diterima dari server.");
      }

      // Check role authorization
      if (data.user?.role !== "admin") {
        throw new Error("Akses Ditolak: Hanya akun dengan role Admin yang dapat mengakses Dashboard CMS JariBakat.");
      }

      setAuthToken(data.accessToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Gagal masuk. Periksa kembali email dan kata sandi Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 font-sans p-4 selection:bg-[#EEF2FF] selection:text-[#1E1B4B]">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-block relative overflow-visible mb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/jaribakat-logo-landscape.png"
              alt="JariBakat Logo"
              className="h-16 w-auto mx-auto object-contain"
              onError={(e) => {
                // Fallback to text logo if image fails to load
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] dark:text-white">
            Selamat Datang di CMS JariBakat
          </h1>
          <p className="text-sm text-[#64748B] dark:text-gray-400 leading-relaxed">
            Masuk dengan akun Admin untuk mengelola konten landing page &amp; sistem JariBakat
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-bold leading-relaxed flex items-start gap-2.5">
            <span className="text-base flex-shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0F172A] dark:text-gray-200 uppercase tracking-wider mb-2">
              Email Admin
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm text-[#0F172A] dark:text-white focus:outline-none focus:border-[#1E1B4B] focus:ring-1 focus:ring-[#1E1B4B] transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-[#0F172A] dark:text-gray-200 uppercase tracking-wider">
                Kata Sandi
              </label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi admin"
              className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm text-[#0F172A] dark:text-white focus:outline-none focus:border-[#1E1B4B] focus:ring-1 focus:ring-[#1E1B4B] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-[#1E1B4B] hover:bg-[#17153B] text-white font-bold text-base transition-all shadow-md cursor-pointer disabled:opacity-50 mt-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memverifikasi Admin...
              </span>
            ) : (
              "Masuk ke Dashboard CMS"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

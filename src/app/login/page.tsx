"use client"

import { Button } from "@/components/Button"
import { Divider } from "@/components/Divider"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Logo } from "@/components/ui/Logo"
import { useRouter } from "next/navigation"
import React from "react"
import { fetchApi, setAuthToken } from "@/lib/api"

export default function Login() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [email, setEmail] = React.useState("admin@jaribakat.com")
  const [password, setPassword] = React.useState("admin123456")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      if (data.accessToken) {
        setAuthToken(data.accessToken)
        router.push("/")
      } else {
        setError("Login failed")
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-4 sm:p-6">
      <div className="flex w-full flex-col items-start sm:max-w-sm">
        <div className="relative flex items-center justify-center rounded-lg bg-white p-3 shadow-lg ring-1 ring-black/5">
          <Logo
            className="size-8 text-blue-500 dark:text-blue-500"
            aria-label="JariBakat logo"
          />
        </div>
        <div className="mt-6 flex flex-col">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            Log in to JariBakat CMS
          </h1>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            Manage landing page content and settings
          </p>
        </div>

        {error && (
          <div className="mt-4 w-full rounded-md bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        <div className="mt-6 w-full">
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-y-6"
          >
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="email-form-item" className="font-medium">
                  Email
                </Label>
                <Input
                  type="email"
                  autoComplete="email"
                  name="email"
                  id="email-form-item"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jaribakat.com"
                  required
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="password-form-item" className="font-medium">
                  Password
                </Label>
                <Input
                  type="password"
                  autoComplete="current-password"
                  name="password"
                  id="password-form-item"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
            >
              {loading ? "Signing in..." : "Sign in to Dashboard"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

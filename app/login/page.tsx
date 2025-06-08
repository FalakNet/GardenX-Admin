"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, LogIn } from "lucide-react"
import { login } from "@/actions/auth"
import { Logo } from "@/components/logo"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      console.log("Submitting login form")
      const result = await login(username, password)
      console.log("Login result:", result)

      if (result.success) {
        console.log("Login successful, redirecting...")
        // Force a hard refresh to ensure middleware picks up the new cookie
        window.location.href = "/admin"
      } else {
        setError(result.error || "Invalid credentials")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo />
          <CardDescription>Enter your credentials to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="username"
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? (
                "Logging in..."
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Secure admin access only
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

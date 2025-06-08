"use client"

import type React from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, LogIn } from "lucide-react"
import { login } from "@/actions/auth"
import { Logo } from "@/components/logo"

const initialState = {
  success: false,
  error: null,
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo />
          <CardDescription>Enter your credentials to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          {state?.error && (
            <Alert className="mb-4 border-red-200">
              <AlertDescription className="text-red-700">{state.error}</AlertDescription>
            </Alert>
          )}

          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="username"
                name="username"
                type="email"
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
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isPending}>
              {isPending ? (
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
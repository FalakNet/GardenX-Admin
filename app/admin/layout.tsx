import type React from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Authentication is handled by middleware
  return <>{children}</>
}

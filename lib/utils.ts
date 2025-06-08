import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace("AED", "").trim()
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-AE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function generateOrderId(): string {
  return `GH-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`
}

export function generateCustomerId(): string {
  return `CUST-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(3, "0")}`
}

"use client"

import * as React from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = {
  className?: string
  selected?: Date | null
  onChange?: (date: Date | null) => void
  minDate?: Date
  maxDate?: Date
  placeholderText?: string
  dateFormat?: string
  // ...add more props as needed
}

function Calendar({
  className,
  selected,
  onChange,
  minDate,
  maxDate,
  placeholderText = "Select date",
  dateFormat = "yyyy-MM-dd",
  ...props
}: CalendarProps) {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      minDate={minDate}
      maxDate={maxDate}
      placeholderText={placeholderText}
      dateFormat={dateFormat}
      className={cn(
        "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
        className
      )}
      // ...props
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

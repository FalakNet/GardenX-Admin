import type React from "react"

interface QRCodeProps {
  value: string
  size?: number
  level?: string
  bgColor?: string
  fgColor?: string
  style?: React.CSSProperties
  includeMargin?: boolean
}

export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  bgColor = "#ffffff",
  fgColor = "#000000",
  style = {},
  includeMargin = false,
}) => {
  // Use an external QR code service instead of client-side generation
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(value)}&size=${size}x${size}&margin=${includeMargin ? 4 : 0}`

  return (
    <img
      src={qrUrl || "/placeholder.svg"}
      alt={`QR code for ${value}`}
      style={{
        backgroundColor: bgColor,
        ...style,
      }}
      width={size}
      height={size}
    />
  )
}

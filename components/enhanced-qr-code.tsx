import type React from "react"
import { QRCode } from "./qr-code"

interface EnhancedQRCodeProps {
  value: string
  size?: number
  level?: string
  bgColor?: string
  fgColor?: string
  style?: React.CSSProperties
  includeMargin?: boolean
  logo?: string
}

export const EnhancedQRCode: React.FC<EnhancedQRCodeProps> = (props) => {
  // Just use the basic QR code component
  return <QRCode {...props} />
}

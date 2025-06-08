import type React from "react"
import { QRCode } from "./qr-code"

interface FunctionalQRCodeProps {
  value: string
  size?: number
  level?: string
  bgColor?: string
  fgColor?: string
  style?: React.CSSProperties
  includeMargin?: boolean
}

export const FunctionalQRCode: React.FC<FunctionalQRCodeProps> = (props) => {
  // Just use the basic QR code component
  return <QRCode {...props} />
}

// QR Code and Ticket ID generation

/**
 * Generate a unique Mask Mirage ticket ID
 * Format: MM26-XXXXXXXX (8 hex characters)
 */
export function generateTicketId(): string {
  const prefix = 'MM26'
  const chars = '0123456789ABCDEF'
  let id = ''
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `${prefix}-${id}`
}

/**
 * Generate a unique QR code ID
 * Format: QR-XXXXXXXX (8 alphanumeric)
 */
export function generateQRCodeId(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let id = ''
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `QR-${id}`
}

/**
 * Validate ticket ID format
 */
export function isValidTicketId(id: string): boolean {
  return /^MM26-[0-9A-F]{8}$/.test(id)
}

/**
 * Validate QR code ID format
 */
export function isValidQRCodeId(id: string): boolean {
  return /^QR-[A-Z0-9]{8}$/.test(id)
}

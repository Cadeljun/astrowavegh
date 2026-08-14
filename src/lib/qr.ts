// QR Code generation for tickets
// Uses QR Server API (free, no API key needed)

export function generateTicketId(): string {
  const prefix = 'MMP'; // Mask Mirage Party
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function getQRCodeUrl(ticketId: string): string {
  // Encode ticket ID into QR code using free API
  const encoded = encodeURIComponent(`https://tickets.astrowavegh.com/tickets/verify?id=${ticketId}`);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}&color=A855F7&bgcolor=020B18`;
}

export function getTicketQRData(ticketId: string, name: string, ticketType: string, email: string): string {
  // Structured data for QR code
  return JSON.stringify({
    id: ticketId,
    event: 'Mask Mirage Party',
    date: '2026-10-10',
    type: ticketType,
    name: name,
    email: email,
    verify: `https://tickets.astrowavegh.com/tickets/verify?id=${ticketId}`,
  });
}

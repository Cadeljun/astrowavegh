// Ticket ID generation and management

/**
 * Generate a unique Mask Mirage ticket ID
 * Format: MM26-XXXXXXXX (8 alphanumeric characters)
 * Example: MM26-9DD3A956
 */
export function generateTicketId(): string {
  const prefix = 'MM26';
  const chars = '0123456789ABCDEF';
  let id = '';
  
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${prefix}-${id}`;
}

/**
 * Validate a ticket ID format
 */
export function isValidTicketIdFormat(id: string): boolean {
  return /^MM26-[0-9A-F]{8}$/.test(id);
}

/**
 * Generate QR code data for a ticket
 * Just encodes the ticket ID for maximum scannability
 */
export function getQRData(ticketId: string): string {
  return ticketId;
}

/**
 * Ticket types and pricing
 */
export const TICKET_TYPES = {
  STANDARD: {
    id: 'standard',
    name: 'GENERAL ADMISSION',
    price: 50,
    currency: 'GHS',
  },
  GROUP: {
    id: 'group',
    name: 'GROUP OF 4',
    price: 180,
    currency: 'GHS',
  },
} as const;

/**
 * Generate a complete ticket object
 */
export function createTicket(
  name: string,
  email: string,
  type: keyof typeof TICKET_TYPES,
  paymentReference: string
) {
  const ticketId = generateTicketId();
  const ticketType = TICKET_TYPES[type];
  
  return {
    ticketId,
    name,
    email,
    type: ticketType.id,
    typeName: ticketType.name,
    price: ticketType.price,
    currency: ticketType.currency,
    event: 'Mask Mirage Party',
    eventDate: '2026-10-10',
    venue: 'Coaches Lounge, East Legon',
    paymentReference,
    status: 'valid' as const,
    createdAt: new Date().toISOString(),
  };
}

// Ticket ID generation and management

/**
 * Generate a unique Mask Mirage ticket ID
 * Format: MM26-XXXXXXXX (8 hex characters)
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
 * Ticket types and pricing - Standard ticket only
 */
export const EGOTICKETS_URL = 'https://egotickets.com/events/the-mask-mirage-party/register';

export const TICKET_TYPES = {
  STANDARD: {
    id: 'standard',
    name: 'Standard',
    price: 50,
    currency: 'GHS',
  },
} as const;

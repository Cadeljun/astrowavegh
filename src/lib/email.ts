import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface TicketEmailData {
  name: string;
  email: string;
  tickets: { ticketId: string; ticketType: string }[];
  amount: number;
  quantity: number;
}

export async function sendTicketEmail(data: TicketEmailData) {
  const { name, email, tickets, amount, quantity } = data;

  const ticketList = tickets
    .map((t, i) => `${i + 1}. ${t.ticketId} (${t.ticketType})`)
    .join('\n');

  const ticketLinks = tickets
    .map((t, i) => `<tr>
      <td style="padding:12px 16px;border-bottom:1px solid #1a1a1a;color:#F5F5F5;font-size:14px;">${i + 1}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #1a1a1a;font-family:monospace;color:#DAAF48;font-size:14px;font-weight:bold;">${t.ticketId}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #1a1a1a;color:#F5F5F5;font-size:14px;">${t.ticketType}</td>
    </tr>`)
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#090909;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <!-- Header -->
    <div style="text-align:center;margin-bottom:40px;">
      <h1 style="color:#DAAF48;font-size:24px;margin:0 0 8px;text-transform:uppercase;letter-spacing:3px;">MASK MIRAGE PARTY</h1>
      <p style="color:#B4B4B4;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0;">Your Ticket Confirmation</p>
    </div>

    <!-- Success Message -->
    <div style="background:rgba(218,175,72,0.05);border:1px solid rgba(218,175,72,0.15);border-radius:12px;padding:24px;text-align:center;margin-bottom:32px;">
      <p style="color:#DAAF48;font-size:18px;font-weight:bold;margin:0 0 8px;">✓ Payment Successful</p>
      <p style="color:#B4B4B4;font-size:14px;margin:0;">${quantity > 1 ? `${quantity} tickets` : 'Your ticket'} ${quantity > 1 ? 'have' : 'has'} been generated</p>
    </div>

    <!-- Ticket Details -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:32px;">
      <p style="color:#B4B4B4;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;">Ticket${quantity > 1 ? 's' : ''}</p>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="padding:8px 16px;text-align:left;color:#B4B4B4;font-size:11px;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #1a1a1a;">#</th>
            <th style="padding:8px 16px;text-align:left;color:#B4B4B4;font-size:11px;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #1a1a1a;">Ticket ID</th>
            <th style="padding:8px 16px;text-align:left;color:#B4B4B4;font-size:11px;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #1a1a1a;">Type</th>
          </tr>
        </thead>
        <tbody>
          ${ticketLinks}
        </tbody>
      </table>
    </div>

    <!-- Event Info -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:32px;">
      <p style="color:#B4B4B4;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;">Event Details</p>
      <table style="width:100%;">
        <tr>
          <td style="padding:8px 0;color:#B4B4B4;font-size:13px;">Event</td>
          <td style="padding:8px 0;color:#F5F5F5;font-size:13px;text-align:right;">Mask Mirage Party</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#B4B4B4;font-size:13px;">Date</td>
          <td style="padding:8px 0;color:#F5F5F5;font-size:13px;text-align:right;">10 October 2026</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#B4B4B4;font-size:13px;">Time</td>
          <td style="padding:8px 0;color:#F5F5F5;font-size:13px;text-align:right;">9:00 PM</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#B4B4B4;font-size:13px;">Venue</td>
          <td style="padding:8px 0;color:#F5F5F5;font-size:13px;text-align:right;">Coaches Lounge, East Legon</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#B4B4B4;font-size:13px;">Total Paid</td>
          <td style="padding:8px 0;color:#DAAF48;font-size:13px;text-align:right;font-weight:bold;">GH¢${amount}</td>
        </tr>
      </table>
    </div>

    <!-- Instructions -->
    <div style="text-align:center;margin-bottom:32px;">
      <p style="color:#F5F5F5;font-size:14px;margin:0 0 8px;">Show your ticket ID at the entrance</p>
      <p style="color:#B4B4B4;font-size:12px;margin:0;">Screenshot this email or save your ticket IDs</p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:24px;border-top:1px solid rgba(255,255,255,0.06);">
      <p style="color:rgba(180,180,180,0.4);font-size:11px;margin:0;">© 2026 AstroWave Entertainment</p>
      <p style="color:rgba(180,180,180,0.3);font-size:10px;margin:8px 0 0;">Questions? Reply to this email or DM @astrowaveevent on Instagram</p>
    </div>

  </div>
</body>
</html>
  `;

  try {
    await resend.emails.send({
      from: 'AstroWave Tickets <tickets@astrowavegh.com>',
      to: email,
      subject: `🎭 Your Mask Mirage Party Ticket${quantity > 1 ? 's' : ''} — ${tickets[0].ticketId}`,
      html,
      text: `Mask Mirage Party Ticket Confirmation\n\nHi ${name},\n\nYour payment was successful!\n\nTickets:\n${ticketList}\n\nEvent: Mask Mirage Party\nDate: 10 October 2026\nTime: 9:00 PM\nVenue: Coaches Lounge, East Legon\nTotal: GH¢${amount}\n\nShow your ticket ID at the entrance.\n\n© 2026 AstroWave Entertainment`,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

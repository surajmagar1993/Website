"use server";

import { Resend } from "resend";
// getSiteSettings import removed as it was unused

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Genesoft Support <onboarding@resend.dev>';

export async function sendTicketReceiptEmail(clientEmail: string, ticketSubject: string, ticketDescription: string) {
  if (!resendApiKey) return { success: false, error: "RESEND_API_KEY missing" };

  try {
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: clientEmail,
      subject: `Ticket Received: ${ticketSubject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4285f4;">We've received your request</h2>
          <p>Hello,</p>
          <p>Your support ticket has been successfully received. Our team will review it and get back to you shortly.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Subject:</strong> ${ticketSubject}</p>
          <p><strong>Description:</strong></p>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 5px; color: #555;">${ticketDescription}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">This is an automated notification. Please do not reply directly to this email.</p>
        </div>
      `
    });

    if (error) {
      console.error("Resend Receipt Error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error("Failed to send receipt email:", err);
    return { success: false, error: err };
  }
}

export async function sendTicketAssignmentEmail(staffEmail: string, ticketId: string, ticketSubject: string) {
  if (!resendApiKey) return { success: false, error: "RESEND_API_KEY missing" };

  try {
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: staffEmail,
      subject: `Action Required: Ticket Assigned #${ticketId.slice(0, 8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4285f4;">New Ticket Assigned to You</h2>
          <p>Hello,</p>
          <p>A support ticket has been assigned to you for resolution.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Ticket ID:</strong> #${ticketId.slice(0, 8)}</p>
          <p><strong>Subject:</strong> ${ticketSubject}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/admin" style="display: inline-block; background: #4285f4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Ticket in Admin Dashboard</a></p>
        </div>
      `
    });

    if (error) {
      console.error("Resend Assignment Error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error("Failed to send assignment email:", err);
    return { success: false, error: err };
  }
}

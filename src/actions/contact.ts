/**
 * Server action for contact form submission.
 * Handles reCAPTCHA verification, saves inquiry to Supabase, and sends email via Resend.
 */
"use server";

import { getSiteSettings } from "@/lib/settings";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

export type ContactState = {
  success?: boolean;
  error?: string;
  message?: string;
};

/** Validates captcha, stores inquiry in DB, and optionally sends notification email. */
export async function submitContactForm(prevState: ContactState, formData: FormData): Promise<ContactState> {
  // Using specific field name passed from client
  const captchaToken = formData.get("captchaToken") as string;
  
  if (!captchaToken) {
    return { success: false, error: "Please complete the ReCAPTCHA verification." };
  }

  const settings = await getSiteSettings();
  const secretKey = settings.recaptcha_secret_key;

  if (!secretKey) {
    return { success: false, error: "ReCAPTCHA configuration missing on server." };
  }

  // Verify with Google
  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `secret=${secretKey}&response=${captchaToken}`,
  });

  const data = await response.json();

  if (!data.success) {
    return { success: false, error: "ReCAPTCHA validation failed. Please try again." };
  }

  // Verification successful
  
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const service = formData.get("service") as string;
  const message = formData.get("message") as string;



  // 1. Save to Supabase (Inquiries Table)
  const { error: dbError } = await supabase
    .from('inquiries')
    .insert({
      name,
      email,
      phone,
      service,
      message,
      status: 'new'
    });

  if (dbError) {
    console.error("Supabase Error:", dbError);
  }

  // 2. Send Email via Resend
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const { error: emailError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Genesoft Website <onboarding@resend.dev>',
        to: settings.contact_email || 'info@genesoftinfotech.com',
        subject: `New Inquiry from ${name}`,
        html: `
          <h1>New Contact Form Submission</h1>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      });

      if (emailError) {
        console.error("Resend Error:", emailError);
      }
    } catch (err) {
      console.error("Email Sending Failed:", err);
    }
  } else {
    console.warn("RESEND_API_KEY missing. Email not sent.");
  }

  return { success: true, message: "Thank you! Your message has been sent successfully." };
}

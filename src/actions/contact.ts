/**
 * Server action for contact form submission.
 * Handles reCAPTCHA verification, saves inquiry to Supabase, and sends email via Resend.
 */
"use server";

import { getSiteSettings } from "@/lib/settings";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";

export type ContactState = {
  success?: boolean;
  error?: string;
  message?: string;
};

// Zod Schema for robust Input Validation
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is too short").max(20, "Phone number is too long"),
  service: z.string().min(2, "Service must be selected"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
});

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
  
  // 1. Zod Input Validation
  const validatedFields = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    service: formData.get("service"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid form data. Please check your inputs.",
    };
  }

  const { name, email, phone, service, message } = validatedFields.data;


  // 2. Save to Supabase (Inquiries Table) using Secure Server Client
  const supabase = await createClient();
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

  // 3. Send Email via Resend
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

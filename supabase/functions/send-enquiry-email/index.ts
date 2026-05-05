import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  let body;

  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: corsHeaders }
    );
  }

  const { name, company, email, message } = body;

  if (!name || !email || !message) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400, headers: corsHeaders }
    );
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing RESEND_API_KEY" }),
      { status: 500, headers: corsHeaders }
    );
  }

  const resend = new Resend(apiKey);

  try {
    const result = await resend.emails.send({
      from: "A3 Accounting <onboarding@resend.dev>",
      to: ["your-email@gmail.com"],
      subject: `New Enquiry from ${name}`,
      html: `
        <h2>New Enquiry</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Company:</b> ${company || "-"}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
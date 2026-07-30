import { NextResponse } from "next/server";
import { decodeBarcodeData, fmtGhc } from "@/lib/barcode-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { encoded, phone, email } = body;

    if (!encoded) {
      return NextResponse.json({ error: "Missing barcode data" }, { status: 400 });
    }

    if (!phone && !email) {
      return NextResponse.json({ error: "Phone number or email is required" }, { status: 400 });
    }

    // Decode and validate barcode
    const data = decodeBarcodeData(encoded);
    if (!data) {
      return NextResponse.json({ error: "Invalid or tampered barcode. Checksum verification failed." }, { status: 400 });
    }

    // Format the summary message
    const docType = data.type === 'RECEIPT' ? 'Receipt' : data.type === 'PAYMENT' ? 'Payment Receipt' : 'Invoice';
    const assemblyName = data.assemblyName || 'Assembly';
    const summaryLines = [
      `${'='.repeat(40)}`,
      `${assemblyName.toUpperCase()}`,
      `${docType} Verification Summary`,
      `${'='.repeat(40)}`,
      ``,
      `${docType} Number: ${data.refNo}`,
      `Issued To: ${data.issuedTo}`,
      `Entity Type: ${data.entityType}`,
      `Revenue Item: ${data.revenueItem}`,
      `Amount: ${fmtGhc(data.amount)}`,
      `Date: ${data.date}`,
      `Status: ${data.status}`,
      data.method ? `Payment Method: ${data.method}` : "",
      ``,
      `${'='.repeat(40)}`,
      `Verification Code: ${data.checksum}`,
      `This is an automated verification from ${assemblyName} RMS.`,
      `If you did not request this, please ignore.`,
      `${'='.repeat(40)}`,
    ].filter(Boolean).join("\n");

    // ── Send via Email (simulated — in production, use SendGrid/Mailgun etc.) ──
    if (email) {
      console.log(`[EMAIL] Sending to ${email}:\n${summaryLines}`);
      // In production, replace with actual email service:
      // await sendEmail({ to: email, subject: `${docType} Verification - ${data.refNo}`, body: summaryLines });
    }

    // ── Send via SMS (simulated — in production, use Twilio/Africa's Talking etc.) ──
    if (phone) {
      const smsMessage = `${assemblyName} ${docType} Verification\n${data.refNo}\n${data.issuedTo}\n${fmtGhc(data.amount)}\n${data.date}\nStatus: ${data.status}\nCode: ${data.checksum}`;
      console.log(`[SMS] Sending to ${phone}:\n${smsMessage}`);
      // In production, replace with actual SMS service:
      // await sendSMS({ to: phone, message: smsMessage });
    }

    return NextResponse.json({
      success: true,
      message: `Summary sent successfully${email ? ' to ' + email : ''}${phone ? ' to ' + phone : ''}.`,
      data: {
        type: docType,
        refNo: data.refNo,
        issuedTo: data.issuedTo,
        amount: fmtGhc(data.amount),
        date: data.date,
        status: data.status,
      },
    });
  } catch (error) {
    console.error("Verify API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

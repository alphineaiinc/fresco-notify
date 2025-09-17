const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

const app = express();
app.use(bodyParser.json());

// === CONFIG (from environment variables) ===
const MANAGER_EMAIL = process.env.MANAGER_EMAIL;   // e.g. manager@fresco.com
const MANAGER_PHONE = process.env.MANAGER_PHONE;   // e.g. +14163880624
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH;
const TWILIO_NUMBER = process.env.TWILIO_NUMBER;   // your Twilio SMS number, e.g. +16234625283
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

const twilioClient = twilio(TWILIO_SID, TWILIO_AUTH);

// === EMAIL Setup ===
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS
  }
});

// === ROUTE ===
app.post("/notify", async (req, res) => {
  const { phone } = req.body;

  try {
    // 1. Send Email
    await transporter.sendMail({
      from: `"Fresco Chatbot" <${GMAIL_USER}>`,
      to: MANAGER_EMAIL,
      subject: "Customer Request to Talk to Manager",
      text: `A customer wants to talk. Their phone number is: ${phone}`
    });

    // 2. Send SMS
    await twilioClient.messages.create({
      body: `Customer wants to talk. Call them at: ${phone}`,
      from: TWILIO_NUMBER,   // must be your Twilio SMS number
      to: MANAGER_PHONE      // must be verified in trial
    });

    // 3. Send WhatsApp (Sandbox)
    await twilioClient.messages.create({
      body: `Customer wants to talk. Call them at: ${phone}`,
      from: "whatsapp:+14155238886",    // Twilio WhatsApp sandbox number
      to: "whatsapp:" + MANAGER_PHONE  // must have joined sandbox
    });

    res.json({ success: true, message: "Notification sent via Email, SMS, and WhatsApp!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Notification server running")
);

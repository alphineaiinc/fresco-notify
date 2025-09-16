const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

const app = express();
app.use(bodyParser.json());

// === CONFIG (from environment variables) ===
const MANAGER_EMAIL = process.env.MANAGER_EMAIL;
const MANAGER_PHONE = process.env.MANAGER_PHONE;
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH;
const TWILIO_NUMBER = process.env.TWILIO_NUMBER;
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
      from: TWILIO_NUMBER,
      to: MANAGER_PHONE
    });

    // 3. Send WhatsApp (optional)
    await twilioClient.messages.create({
      from: "whatsapp:+14155238886", // Twilio sandbox
      to: "whatsapp:" + MANAGER_PHONE,
      body: `Customer wants to talk. Call them at: ${phone}`
    });

    res.json({ success: true, message: "Notification sent!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Notification server running")
);

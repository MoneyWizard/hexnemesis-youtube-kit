require('dotenv').config({ path: './src/.env' });

const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = new Set([
  'https://moneywizard.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// FREE SAMPLE → server log, with optional email delivery
app.post('/submit-lead', async (req, res) => {
  const email = String(req.body.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Enter a valid email address.' });
  }

  console.log(`[LEAD ${new Date().toISOString()}] ${email}`);

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.json({ success: true, delivery: 'server-log' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: 'New YouTube End Screen Scorecard lead',
      text: `New lead: ${email}`
    });

    res.json({ success: true, delivery: 'email' });
  } catch (error) {
    console.error('Lead delivery failed:', error.message);
    res.json({ success: true, delivery: 'server-log' });
  }
});

// STRIPE $1 PAYMENT (Anonymous)
app.post('/create-checkout-session', async (req, res) => {
  const email = String(req.body.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Checkout is not configured yet.' });
  }

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'YouTube End Screens Mastery Kit 2026' },
          unit_amount: 2700,
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: email,
      success_url: `${req.headers.origin}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout creation failed:', error.message);
    res.status(500).json({ error: 'Checkout is temporarily unavailable. Please try again.' });
  }
});

app.listen(port, () => {
  console.log(`HexNemesis Server LIVE on port ${port}`);
});

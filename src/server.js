require('dotenv').config({ path: './src/.env' });

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// FREE SAMPLE → Thunderbird
app.post('/submit-lead', async (req, res) => {
  console.log('LEAD:', req.body.email);
  
  // Thunderbird email
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.SMTP_USER,
    subject: 'HexNemesis YouTube Lead',
    text: `New lead: ${req.body.email}`
  });
  
  res.json({ success: true });
});

// STRIPE $27 PAYMENT (Anonymous)
app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'YouTube End Screens Mastery Kit 2026'
        },
        unit_amount: 2700,
      },
      quantity: 1,
    }],
    mode: 'payment',
    customer_email: req.body.email,
    success_url: `${req.headers.origin}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.origin}?canceled=true`,
  });
  
  res.json({ url: session.url });
});

app.listen(3000, () => {
  console.log('🚀 HexNemesis Server LIVE on port 3000');
});

require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post('/send-mail', async (req, res) => {
  const {
    name,
    phone,
    email,
    selectedHouse,
    selectedTrademark,
    selectedColor,
    adminEmail,
    widgetName,
    pdfUrl,
    translations
  } = req.body;

  if (!name || !phone || !email || !adminEmail || !widgetName || !pdfUrl || !translations) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const htmlContent = `
      <h2>${translations.form.letter_header} "${widgetName}"</h2>
      <p><strong>${translations.form.your_name}:</strong> ${name}</p>
      <p><strong>${translations.form.phone_number}:</strong> ${phone}</p>
      <p><strong>${translations.form.email}:</strong> ${email}</p>
      <p><strong>${translations.form.house_type}:</strong> ${selectedHouse}</p>
      <p><strong>${translations.form.tm}:</strong> ${selectedTrademark}</p>
      <p><strong>${translations.form.color}:</strong> ${selectedColor}</p>
      <p>${translations.form.letter_pdf}: <a href="${pdfUrl}" target="_blank">${translations.widget.download_pdf}</a></p>
  `;

  try {
    await transporter.sendMail({
      from: '"Visualiser" <visualiser@fasiding.com.ua>',
      to: adminEmail,
      subject: `${translations.form.letter_subject}`,
      html: htmlContent,
    });

    await transporter.sendMail({
      from: '"Visualiser" <visualiser@fasiding.com.ua>',
      to: email,  
      subject: `${translations.form.letter_subject}`,
      html: `
        <h3>${translations.form.letter_thanku}, ${name}!</h3>
        <p>${translations.form.letter_feedback}</p>
        <hr/>
        ${htmlContent}
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Помилка надсилання:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущено: http://localhost:${PORT}`);
});

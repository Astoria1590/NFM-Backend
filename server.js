const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

console.log("SERVER STARTING...");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTE (MAKE SURE THIS MATCHES YOUR FRONTEND)
app.post("/send-email", async (req, res) => {
  console.log("FORM SUBMITTED:", req.body);

  const { name, email, ministry, message } = req.body;

  let targetEmail;

  if (ministry === "kids") {
    targetEmail = "kidsministry@gmail.com";
  } else if (ministry === "women") {
    targetEmail = "womensministry@gmail.com";
  } else if (ministry === "men") {
    targetEmail = "astoria0951@gmail.com";
  } else {
    targetEmail = "outreach@gmail.com";
  }

  console.log("Sending to:", targetEmail);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: `"New Faith Ministries" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: targetEmail,
      subject: `New Ministry Signup (${ministry})`,
      text: `
Name: ${name}
Email: ${email}
Ministry: ${ministry}

Message:
${message}
      `
    });

    console.log("EMAIL SENT SUCCESSFULLY ✅");
    res.send("Success");

  } catch (err) {
    console.log("EMAIL ERROR ❌:", err);
    res.status(500).send("Error sending email");
  }
});

// IMPORTANT FOR RENDER (USE DYNAMIC PORT)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

console.log("SERVER STARTING...");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTE
app.post("/send", async (req, res) => {
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
    // 📩 EMAIL TO YOU (MINISTRY LEADER)
    await transporter.sendMail({
      from: `"New Faith Ministries" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: targetEmail,
      subject: `New Ministry Signup (${ministry})`,
      html: `
        <div style="font-family: Arial; background:#f4f4f4; padding:20px;">
          <div style="max-width:600px; margin:auto; background:white; border-radius:10px; padding:20px;">
            
            <h2 style="color:#222;">New Ministry Signup</h2>

            <p style="color:#555; font-style: italic;">
              “Thank you for being a part of New Faith Ministries”
            </p>

            <hr>

            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Ministry:</strong> ${ministry}</p>

            <hr>

            <p><strong>Message:</strong></p>
            <p style="background:#f9f9f9; padding:10px; border-radius:5px;">
              ${message}
            </p>

          </div>
        </div>
      `
    });

    // 📬 AUTO-REPLY TO USER
    await transporter.sendMail({
      from: `"New Faith Ministries" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank you for joining New Faith Ministries 🙏",
      html: `
        <div style="font-family: Arial; padding: 20px; background: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px;">
            
            <h2 style="color: #333;">New Faith Ministries</h2>

            <p style="font-style: italic; color:#555;">
              “Thank you for being a part of New Faith Ministries”
            </p>

            <hr>

            <p>Hi ${name},</p>

            <p>We’re excited that you’re interested in joining the <strong>${ministry}</strong> ministry 🙌</p>

            <p>Our team will be reaching out to you soon.</p>

            <hr>

            <p><strong>Your Message:</strong></p>
            <p style="background:#f9f9f9; padding:10px; border-radius:5px;">
              ${message}
            </p>

            <br>

            <p>Blessings,</p>
            <p><strong>New Faith Ministries Team</strong></p>

          </div>
        </div>
      `
    });

    console.log("EMAILS SENT SUCCESSFULLY ✅");
    res.send("Success");

  } catch (err) {
    console.log("EMAIL ERROR ❌:", err);
    res.status(500).send("Error sending email");
  }
});

// IMPORTANT FOR RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});

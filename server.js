const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");

console.log("SERVER STARTING...");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   🔌 DATABASE CONNECTION
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("MongoDB Error ❌:", err));

const SignupSchema = new mongoose.Schema({
  name: String,
  email: String,
  ministry: String,
  message: String,
  date: { type: Date, default: Date.now }
});

const Signup = mongoose.model("Signup", SignupSchema);

/* =========================
   📩 FORM SUBMISSION ROUTE
========================= */
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

  try {
    /* 🗄️ SAVE TO DATABASE */
    await Signup.create({
      name,
      email,
      ministry,
      message
    });

    console.log("Saved to database ✅");

    /* 📧 EMAIL SETUP */
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    /* 📩 EMAIL TO MINISTRY */
    await transporter.sendMail({
      from: `"New Faith Ministries" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: targetEmail,
      subject: `New Ministry Signup (${ministry})`,
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2>New Ministry Signup</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Ministry:</strong> ${ministry}</p>
          <p><strong>Message:</strong> ${message}</p>
        </div>
      `
    });

    /* 📬 AUTO RESPONSE */
    await transporter.sendMail({
      from: `"New Faith Ministries" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank You for Being a Part of New Faith Ministries 🙏",
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2>Welcome to New Faith Ministries 🙌</h2>
          <p><em>“Thank you for being a part of New Faith Ministries”</em></p>

          <p>Hi ${name},</p>

          <p>We received your request for the <strong>${ministry}</strong> ministry.</p>
          <p>Our team will reach out soon!</p>

          <hr>

          <p><strong>Your Message:</strong></p>
          <p>${message}</p>

          <br>

          <p><strong>New Faith Ministries</strong></p>
          <p>2879 Brice Road, Columbus, OH 43109</p>
        </div>
      `
    });

    console.log("EMAILS SENT SUCCESSFULLY ✅");
    res.send("Success");

  } catch (err) {
    console.log("ERROR ❌:", err);
    res.status(500).send("Error processing request");
  }
});

/* =========================
   🔐 ADMIN ROUTE
========================= */
app.get("/admin", async (req, res) => {
  const password = req.query.password;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).send("Unauthorized");
  }

  const data = await Signup.find().sort({ date: -1 });

  res.json(data);
});

/* =========================
   🚀 SERVER START
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});

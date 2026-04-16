const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

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
   🔐 AUTH CONFIG
========================= */
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASSWORD = process.env.New_Faith_Ministries_Admin

/* =========================
   🔐 LOGIN ROUTE
========================= */
app.post("/login", (req, res) => {
  const { password } = req.body;

   console.log("Entered password:", password);
console.log("ENV password:", ADMIN_PASSWORD);

if (password !== ADMIN_PASSWORD) {
  return res.status(401).send("Invalid password");
}

  if (password !== ADMIN_PASSWORD) {
  return res.status(401).send("Invalid password");
}

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, {
    expiresIn: "2h"
  });

  res.json({ token });
});

/* =========================
   🔐 TOKEN MIDDLEWARE
========================= */
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(403).send("No token");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
}

/* =========================
   📊 PROTECTED ADMIN DATA
========================= */
app.get("/admin/signups", verifyToken, async (req, res) => {
  const data = await Signup.find().sort({ date: -1 });
  res.json(data);
});

/* =========================
   📩 FORM SUBMISSION ROUTE
========================= */
app.post("/send", async (req, res) => {
  console.log("FORM SUBMITTED:", req.body);

  const { name, email, ministry, message } = req.body;

  let targetEmail;

  if (Ministry === "Kids") {
    targetEmail = "kidsministry@gmail.com";
  } else if (Ministry === "Women") {
    targetEmail = "womensministry@gmail.com";
  } else if (Ministry === "Men") {
    targetEmail = "astoria0951@gmail.com";
  } else (Ministry === "Homeless") 
    targetEmail = "outreach@gmail.com";

  try {
    /* 🗄️ SAVE TO DATABASE */
    await Signup.create({
      name,
      email,
      ministry,
      message
    });

    console.log("Saved to database ✅");

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

    /* 📬 AUTO RESPONSE (UPGRADED STYLE) */
    await transporter.sendMail({
      from: `"New Faith Ministries" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to New Faith Ministries 🙏",
      html: `
        <div style="
          font-family: Arial;
          padding:30px;
          background: linear-gradient(135deg, #0f172a, #1e3a8a);
          color: white;
        ">
          <h1 style="color:#facc15;">New Faith Ministries</h1>

          <h2>Thank You for Being a Part of Our Family 🙌</h2>

          <p>Hi ${name},</p>

          <p>
            We’re excited that you signed up for the
            <strong>${ministry}</strong> ministry.
          </p>

          <p>Our team will be reaching out to you soon!</p>

          <div style="
            background:white;
            color:black;
            padding:15px;
            margin-top:20px;
            border-radius:8px;
          ">
            <p><strong>Your Message:</strong></p>
            <p>${message}</p>
          </div>

          <hr style="margin:30px 0;">

          <p><strong>New Faith Ministries</strong></p>
          <p>2879 Brice Rd, Columbus, OH 43232</p>
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
   🚀 SERVER START
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});

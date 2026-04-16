```js
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

/* =========================
   📊 MODEL
========================= */
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
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/* =========================
   🔐 LOGIN ROUTE
========================= */
app.post("/login", (req, res) => {
  const { password } = req.body;

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
   📊 ADMIN DATA
========================= */
app.get("/admin/signups", verifyToken, async (req, res) => {
  const data = await Signup.find().sort({ date: -1 });
  res.json(data);
});

/* =========================
   🧹 DELETE TEST DATA ONLY
========================= */
app.delete("/admin/delete-test", verifyToken, async (req, res) => {
  try {
    const result = await Signup.deleteMany({
      $or: [
        { name: /test/i },
        { email: /test/i },
        { message: /test/i }
      ]
    });

    res.send(`Deleted ${result.deletedCount} test entries`);
  } catch (err) {
    console.log("DELETE ERROR ❌:", err);
    res.status(500).send("Error deleting test data");
  }
});

/* =========================
   📩 FORM SUBMISSION
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
    /* SAVE TO DB */
    await Signup.create({ name, email, ministry, message });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    /* EMAIL TO MINISTRY */
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

    /* AUTO RESPONSE */
    await transporter.sendMail({
      from: `"New Faith Ministries" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to New Faith Ministries 🙏",
      html: `
      <div style="margin:0;padding:0;background:#f4f6fb;">
        
        <div style="
          max-width:600px;
          margin:auto;
          background:#ffffff;
          border-radius:12px;
          overflow:hidden;
          font-family:Arial, sans-serif;
        ">

          <!-- HEADER -->
          <div style="
            background: linear-gradient(135deg, #ffffff, #e5e7eb);
            padding:30px;
            text-align:center;
          ">
            <h1 style="color:#1e3a8a;margin:0;">New Faith Ministries</h1>
            <p style="color:#111111;margin-top:10px;">
              Thank You for Being a Part of Our Family 🙌
            </p>
          </div>

          <!-- BODY -->
          <div style="padding:25px;color:#111111;">
            <p>Hi ${name},</p>

            <p>
              We’re excited that you signed up for the 
              <strong>${ministry}</strong> ministry.
            </p>

            <p>Our team will be reaching out to you soon!</p>

            <!-- MESSAGE BOX -->
            <div style="
              background:#f1f1f1;
              padding:15px;
              margin-top:20px;
              border-radius:8px;
            ">
              <p><strong>Your Message:</strong></p>
              <p>${message}</p>
            </div>
          </div>

          <!-- FOOTER -->
          <div style="
            background:#f9fafb;
            padding:20px;
            text-align:center;
            font-size:13px;
            color:#444;
          ">
            <p><strong>New Faith Ministries</strong></p>
            <p>2879 Brice Rd, Columbus, OH 43232</p>
            <p style="margin-top:10px;">© 2026 All rights reserved</p>
          </div>

        </div>

      </div>
      `
    });

    res.send("Success");

  } catch (err) {
    console.log("ERROR ❌:", err);
    res.status(500).send("Error processing request");
  }
});

/* =========================
   🚀 SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
```

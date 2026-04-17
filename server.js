const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   🔌 DATABASE
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

/* =========================
   📊 MODELS
========================= */
const SignupSchema = new mongoose.Schema({
  name: String,
  email: String,
  ministry: String,
  message: String,
  date: { type: Date, default: Date.now }
});

const Signup = mongoose.model("Signup", SignupSchema);

const FileSchema = new mongoose.Schema({
  name: String,
  url: String,
  date: { type: Date, default: Date.now }
});

const File = mongoose.model("File", FileSchema);

/* =========================
   🔐 AUTH
========================= */
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

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
   📩 FORM SUBMISSION
========================= */
app.post("/send", async (req, res) => {
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
    await Signup.create({ name, email, ministry, message });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

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

    await transporter.sendMail({
      from: `"New Faith Ministries" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to New Faith Ministries 🙏",
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2>Welcome 🙌</h2>
          <p>Hi ${name},</p>
          <p>We received your request for <strong>${ministry}</strong>.</p>
          <p>We’ll contact you soon!</p>
          <hr>
          <p><strong>New Faith Ministries</strong></p>
          <p>2879 Brice Rd, Columbus, OH</p>
        </div>
      `
    });

    res.send("Success");

  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});

/* =========================
   📊 ADMIN DATA
========================= */
app.get("/admin/signups", verifyToken, async (req, res) => {
  const data = await Signup.find().sort({ date: -1 });
  res.json(data);
});

/* =========================
   🧹 DELETE SIGNUP
========================= */
app.delete("/admin/delete/:id", verifyToken, async (req, res) => {
  await Signup.findByIdAndDelete(req.params.id);
  res.send("Deleted");
});

/* =========================
   📁 FILE STORAGE
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* =========================
   📁 UPLOAD FILE
========================= */
app.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const file = await File.create({
      name: req.file.originalname,
      url: req.file.filename
    });

    res.json(file);
  } catch (err) {
    console.log(err);
    res.status(500).send("Upload failed");
  }
});

/* =========================
   📁 GET FILES
========================= */
app.get("/files", verifyToken, async (req, res) => {
  const files = await File.find().sort({ date: -1 });
  res.json(files);
});

/* =========================
   📁 DELETE FILE
========================= */
app.delete("/files/:id", verifyToken, async (req, res) => {
  const file = await File.findById(req.params.id);

  if (file) {
    fs.unlinkSync(`uploads/${file.url}`);
    await File.findByIdAndDelete(req.params.id);
  }

  res.send("Deleted");
});

/* =========================
   📁 SERVE FILES
========================= */
app.use("/uploads", express.static("uploads"));

/* =========================
   🚀 SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
```

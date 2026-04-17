```js
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const { v2: cloudinary } = require("cloudinary");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

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
  public_id: String,
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

  let targetEmail = "outreach@gmail.com";

  if (ministry === "kids") targetEmail = "kidsministry@gmail.com";
  if (ministry === "women") targetEmail = "womensministry@gmail.com";
  if (ministry === "men") targetEmail = "astoria0951@gmail.com";

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
      to: targetEmail,
      subject: `New Signup (${ministry})`,
      html: `<p>${name} (${email})</p><p>${message}</p>`
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
   ☁️ CLOUDINARY CONFIG
========================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* =========================
   ☁️ STORAGE
========================= */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "nfm-files",
    resource_type: "auto"
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
      url: req.file.path,
      public_id: req.file.filename
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
    await cloudinary.uploader.destroy(file.public_id, {
      resource_type: "auto"
    });

    await File.findByIdAndDelete(req.params.id);
  }

  res.send("Deleted");
});

/* =========================
   🚀 SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
```

<<<<<<< HEAD
```html
<!DOCTYPE html>
<html>
<head>
  <title>Dashboard</title>
=======
const multer = require("multer");
const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
>>>>>>> bb36624 (debug login)

  <style>
    body {
      font-family: Arial;
      padding: 20px;
    }

    h2 {
      margin-bottom: 20px;
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .filters input {
      padding: 8px;
      margin-right: 10px;
    }

    button {
      padding: 8px 14px;
      cursor: pointer;
      border: none;
      border-radius: 5px;
    }

    .delete-btn {
      background: #dc2626;
      color: white;
    }

<<<<<<< HEAD
    .delete-btn:hover {
      background: #b91c1c;
    }
=======
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
>>>>>>> bb36624 (debug login)

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 10px;
      border: 1px solid #ccc;
    }

<<<<<<< HEAD
    th {
      background: #1e3a8a;
      color: white;
    }
  </style>
</head>
<body>

<h2>Ministry Signups</h2>

<div class="top-bar">
  <div class="filters">
    <input id="nameFilter" placeholder="Filter by name">
    <input id="emailFilter" placeholder="Filter by email">
    <input id="ministryFilter" placeholder="Filter by ministry">
  </div>

  <button onclick="downloadExcel()">Download Excel</button>
</div>

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Ministry</th>
      <th>Message</th>
      <th>Date</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody id="tableBody"></tbody>
</table>

<script>
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "admin.html";
}

let allData = [];

/* FETCH DATA */
fetch("https://nfm-backend.onrender.com/admin/signups", {
  headers: {
    Authorization: token
=======
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
>>>>>>> bb36624 (debug login)
  }
})
.then(res => res.json())
.then(data => {
  allData = data;
  renderTable(data);
});

<<<<<<< HEAD
/* RENDER TABLE */
function renderTable(data) {
  const table = document.getElementById("tableBody");
  table.innerHTML = "";

  data.forEach(item => {
    const row = `
      <tr>
        <td>${item.name}</td>
        <td>${item.email}</td>
        <td>${item.ministry}</td>
        <td>${item.message}</td>
        <td>${new Date(item.date).toLocaleString()}</td>
        <td>
          <button class="delete-btn" onclick="deleteRow('${item._id}')">
            Delete
          </button>
        </td>
      </tr>
    `;
    table.innerHTML += row;
  });
}

/* DELETE ROW */
function deleteRow(id) {
  if (!confirm("Are you sure you want to delete this entry?")) return;

  fetch(`https://nfm-backend.onrender.com/admin/delete/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token
    }
  })
  .then(() => {
    allData = allData.filter(item => item._id !== id);
    renderTable(allData);
  });
}

/* FILTERING */
document.getElementById("nameFilter").addEventListener("input", applyFilters);
document.getElementById("emailFilter").addEventListener("input", applyFilters);
document.getElementById("ministryFilter").addEventListener("input", applyFilters);

function applyFilters() {
  const name = document.getElementById("nameFilter").value.toLowerCase();
  const email = document.getElementById("emailFilter").value.toLowerCase();
  const ministry = document.getElementById("ministryFilter").value.toLowerCase();

  const filtered = allData.filter(item =>
    item.name.toLowerCase().includes(name) &&
    item.email.toLowerCase().includes(email) &&
    item.ministry.toLowerCase().includes(ministry)
  );

  renderTable(filtered);
}

/* DOWNLOAD CSV */
function downloadExcel() {
  let csv = "Name,Email,Ministry,Message,Date\n";

  allData.forEach(item => {
    csv += `${item.name},${item.email},${item.ministry},${item.message},${new Date(item.date).toLocaleString()}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "signups.csv";
  a.click();
}
</script>

</body>
</html>
```
=======
/* =========================
   🚀 SERVER START
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
>>>>>>> bb36624 (debug login)

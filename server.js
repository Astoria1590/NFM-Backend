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
  replyTo: email,
  to: targetEmail,
  subject: `New Ministry Signup (${ministry})`,
  html: `
  <div style="margin:0; padding:0; font-family: Arial, sans-serif; background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); padding:40px;">
    
    <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden;">
      
      <!-- HEADER -->
      <div style="background: linear-gradient(135deg, #1e3c72, #2a5298); color:white; padding:20px; text-align:center;">
        <h2 style="margin:0;">New Faith Ministries</h2>
        <p style="margin:5px 0 0; font-size:14px;">New Ministry Signup</p>
      </div>

      <!-- BODY -->
      <div style="padding:25px;">
        
        <p style="font-style:italic; color:#555;">
          “Thank you for being a part of New Faith Ministries”
        </p>

        <hr>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Ministry:</strong> ${ministry}</p>

        <hr>

        <p><strong>Message:</strong></p>
        <div style="background:#f4f4f4; padding:12px; border-radius:8px;">
          ${message}
        </div>

      </div>

      <!-- FOOTER -->
      <div style="background:#f9f9f9; padding:15px; text-align:center; font-size:12px; color:#777;">
        New Faith Ministries<br>
        2879 Brice Road, Columbus, OH 43109
      </div>

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

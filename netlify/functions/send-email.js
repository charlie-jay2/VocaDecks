require("dotenv").config();
const nodemailer = require("nodemailer");

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    try {
        const { name, email } = JSON.parse(event.body);

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD,
            },
        });

        let mailOptions = {
            from: `"VocaDecks" <${process.env.EMAIL}>`,
            to: email,
            subject: "Welcome to VocaDecks Newsletter!",
            html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  @import url("https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap");
                </style>
              </head>
              <body
                style="
                  margin: 0;
                  padding: 0;
                  background-color: #f5f5f5;
                  font-family: 'Raleway', Arial, sans-serif;
                ">
                <table
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  style="
                    max-width: 600px;
                    margin: auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                  ">
                  <tr>
                    <td align="center" style="padding: 20px">
                      <img
                        src="https://iili.io/3IAmUWF.png"
                        alt="Vocadecks Logo"
                        style="max-width: 330px; display: block" />
                    </td>
                  </tr>
            
                  <tr>
                    <td align="center" style="padding: 10px">
                      <p
                        style="
                          font-size: 20px;
                          font-weight: bold;
                          color: #333333;
                          margin: 0;
                        ">
                        🎉 Thank You for Signing Up! 🎉
                      </p>
                    </td>
                  </tr>
            
                  <tr>
                    <td align="center" style="padding: 20px">
                      <p style="color: #333333; font-size: 16px; margin: 0">
                        Hi <b>${name}</b>, <br>  
                        You've successfully joined the <b>VocaDecks Newsletter</b>! 
                        Expect exciting updates, exclusive content, and more.
                      </p>
                      <br>
                      <p
                        style="
                          font-size: 16px;
                          font-weight: bold;
                          color: #4CAF50;
                          margin: 10px 0;
                        ">
                        🔥 As a subscriber, you'll be the FIRST to know when new card drops happen! 🔥
                      </p>
                      <p style="color: #333333; font-size: 14px;">
                        If you didn’t sign up, you can ignore this email.
                      </p>
                    </td>
                  </tr>
            
                  <tr>
                    <td
                      align="center"
                      style="padding: 20px; font-size: 12px; color: #666666">
                      © 2025 Vocadecks. All Rights Reserved.
                    </td>
                  </tr>
                </table>
              </body>
            </html>
            `,
        };

        await transporter.sendMail(mailOptions);

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: "Confirmation email sent successfully!" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: "Failed to send email.", error: error.message }),
        };
    }
};

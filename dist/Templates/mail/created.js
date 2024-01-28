"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (username) => __awaiter(void 0, void 0, void 0, function* () {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="utf-8">
      <title>Account Created Successfully</title>
      <style>
          body {
              font-family: Arial, sans-serif;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
          }
          .header {
              background-color: #007BFF;
              color: #ffffff;
              text-align: center;
              padding: 20px 0;
          }
          .content {
              padding: 20px;
              text-align: center;
          }
          .button {
              display: inline-block;
              background-color: #5b5f63;
              color: #ffffff;
              font-size: 16px;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 5px;
          }
          .footer {
              padding: 20px 0;
              color: #888888;
              font-size: 12px;
              text-align: center;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Account Created Successfully</h1>
          </div>
          <div class="content">
              
              <br>
              <p>Hi ${username},</p>
              <br>
              <p>Your new account for MEDONMA has been successfully created. We're excited to have you as a part of our community!</p>
              <br>
              <p>Please keep your account information safe and do not share it with others. If you did not create this account, please contact our support team immediately.</p>
              <br>
              <p>Thank you for choosing MEDONMA. We look forward to providing you with a great experience.</p>
          </div>
          <div align="center" style="padding: 30px 0 20px 0;">
              <p style="margin:20px 0">
                  Sent with &#10084; by MEDONMA Team<br>
                  <a href="https://medonma.me" style="color:#6e5baa" target="_blank">https://medonma.com</a>
              </p>
          </div>
          <div class="footer">
              This is an automated email. Please do not reply to this message.
          </div>
      </div>
  </body>
  </html>
  `;
});

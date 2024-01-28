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
exports.default = (username, device) => __awaiter(void 0, void 0, void 0, function* () {
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const location = device.timeZone || 'Asia/Kolkata'; // Replace with the actual location (timezone)
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: location,
        timeZoneName: 'short',
    };
    const formattedDate = date.toLocaleString('en-US', options);
    const [datePart, timePart] = formattedDate.split(', ');
    const [month, day, year] = datePart.split('/');
    const [time, amPm, timeZone] = timePart.split(' ');
    const [hour, minute, second] = time.split(':');
    const finalFormattedDate = `${day}/${month}/${year} ${hour}:${minute}:${second} ${amPm} ${timeZone}`;
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="utf-8">
      <title>[MEDONMA] - New Device Login to Your Account</title>
  </head>
  <body>
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
              <td align="center" bgcolor="#f4f4f4">
                  <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff;">
                      
                      <tr>
                          <td align="center" style="padding: 20px 0 30px 0;">
                              <h1><center>Hi ${username}!</center></h1>
                              <br>
                              <h2></h2>
                              <p>We want to inform you that a new device has been used to access your account.</p>
                              <br>
                              <p><strong>Device Information:</strong></p>
                              <ul align="left" style="background-color: #000000; color: #ffffff; padding: 10px 20px; list-style: none;">
                                  <li><strong>Time:</strong> ${finalFormattedDate}</li>
                                  <li><strong>Device:</strong> ${device.browser.browserName} (${device.os})</li>
                                  <li><strong>Location:</strong> ${device.location_} (${device.publicIP})</li>
                              </ul>
                              <br>
                              <p>Please keep your account information safe and do not share it with others. If you did not authorize this login, please contact our support team immediately.</p>
                              <p>Thank you for choosing MEDONMA. We look forward to providing you with a great experience.</p>
                          </td>
                      </tr>
                      <tr>
                          <td align="center" style="padding: 30px 0 20px 0;">
                              <p style="margin:20px 0">
                                  Sent with &#10084; by MEDONMA Team<br>
                                  <a href="https://medonma.me" style="color:#6e5baa" target="_blank">https://medonma.com</a>
                              </p>                        
                          </td>
                      </tr>
                      <tr>
                          <td align="center" style="padding: 10px 0 20px 0; color: #888888; font-size: 12px;">
                              This is an automated email. Please do not reply to this message.
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
  </body>
  </html>`;
});

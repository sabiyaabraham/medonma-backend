export default async (
  username: string,
  otp: number | string,
): Promise<string> => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>[MEDONMA] - OTP for Account Creation</title>
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
                              <p>Your verification code is: ${otp}</p>
                              <br>
                              <p>This OTP is for creating your account and is valid for 10 minutes. Please keep it confidential and do not share it with anyone else.</p>
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
  </html>
  `
}

/**
 * @description      : Mail manager
 * @author           : Sabiya Abraham
 * @group            : Team MEDONMA
 * @created          : 27/01/2024 - 14:05:15
 *
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 27/01/2024
 * - Author          : Sabiya Abraham
 * - Modification    :
 **/
import nodemailer from 'nodemailer'
import otpGenerator from 'otp-generator'
import { otp, created, device_otp, device_login } from '../Templates/mail'

class MAIL {
  private EMAIL = {
    user: process.env.EMAIL_ID || '',
    password: process.env.EMAIL_PASSWORD || '',
  }

  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: this.EMAIL.user,
      pass: this.EMAIL.password,
    },
  })

  async sendMail(
    email: string,
    subject: string,
    content: string,
  ): Promise<any> {
    try {
      const info = await this.transporter.sendMail({
        from: `"🧑‍‍‍‍‍‍‍🏻 MEDONMA 🤖" <${this.EMAIL.user}>`,
        to: email,
        subject: subject,
        text: 'CODE NOT SUPPORTED',
        html: content,
      })

      return {
        status: 200,
        error: false,
        message: 'Email sent successfully.',
        data: info.messageId,
      }
    } catch (error: any) {
      return {
        status: 500,
        error: true,
        message: 'Failed to send email.',
        data: error.message || null,
      }
    }
  }
}

export const sendOTP = async (name: string, email: string): Promise<any> => {
  try {
    const mail = new MAIL()
    const newOtp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    })

    const username = name || email.split('@')[0]
    const content = await otp(username, newOtp.toString())

    const mailSendResult = await mail.sendMail(
      email,
      `[ MEDONMA ] OTP for create your account: ${username}`,
      content,
    )

    return {
      status: mailSendResult.status,
      error: mailSendResult.error,
      message: mailSendResult.message,
      data: newOtp.toString() || null,
    }
  } catch (error: any) {
    return {
      status: 500,
      error: true,
      message: 'Error on sending OTP email.',
      data: error.message || null,
    }
  }
}

export const accountCreated = async (
  name: string,
  email: string,
): Promise<any> => {
  try {
    const mail = new MAIL()
    const username = name || email.split('@')[0]
    const content = await created(username)

    const mailSendResult = await mail.sendMail(
      email,
      `[MEDONMA] Account Created Successfully`,
      content,
    )

    return {
      status: mailSendResult.status,
      error: mailSendResult.error,
      message: mailSendResult.message,
      data: null,
    }
  } catch (error: any) {
    return {
      status: 500,
      error: true,
      message: 'Error on sending account creation email.',
      data: error.message || null,
    }
  }
}

export const sendDeviceOTP = async (
  name: string,
  email: string,
  device: any,
): Promise<any> => {
  try {
    const mail = new MAIL()
    const newOtp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    })

    const username = name || email.split('@')[0]
    const content = await device_otp(username, newOtp.toString(), device)

    const mailSendResult = await mail.sendMail(
      email,
      `[MEDONMA] - OTP for New Device`,
      content,
    )

    return {
      status: mailSendResult.status,
      error: mailSendResult.error,
      message: mailSendResult.message,
      data: newOtp.toString() || null,
    }
  } catch (error: any) {
    return {
      status: 500,
      error: true,
      message: 'Error on sending OTP email.',
      data: error.message || null,
    }
  }
}

export const sendDevice = async (
  name: string,
  email: string,
  device: any,
): Promise<any> => {
  try {
    const mail = new MAIL()

    const username = name || email.split('@')[0]
    const content = await device_login(username, device)

    const mailSendResult = await mail.sendMail(
      email,
      `[MEDONMA] - New Device Login`,
      content,
    )

    return {
      status: mailSendResult.status,
      error: mailSendResult.error,
      message: mailSendResult.message,
      data: null,
    }
  } catch (error: any) {
    return {
      status: 500,
      error: true,
      message: 'Error on sending OTP email.',
      data: error.message || null,
    }
  }
}

export default {
  sendOTP,
  accountCreated,
  sendDeviceOTP,
  sendDevice,
}

/**
 * @description      : Auth functions
 * @author           : Sabiya Abraham
 * @group            : Team MEDONMA
 * @created          : 27/01/2024 - 15:42:31
 *
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 27/01/2024
 * - Author          : Sabiya Abraham
 * - Modification    :
 **/
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { promisify } from 'util'
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
  names,
} from 'unique-names-generator'

import filterObj from '../lib/filterObj'
import MAIL from '../lib/mail'
import { User, Device, Admin } from '../Models'
import protect from '../utils/protect'
import { Request } from 'express'

const JWT_SECRET: string = process.env.JWT_SECRET
  ? process.env.JWT_SECRET
  : 'medonma'

interface DecodedToken {
  id: string
  email: string
}

const signToken = (id: string, email: string): string =>
  jwt.sign({ id, email }, JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  })

interface CreateUserData {
  firstName: string
  lastName: string
  email: string
  password: string
  phoneNumber: string
}

interface CreateResponse {
  status: number
  error: boolean
  message: string
  data: { email?: string; errorDetails?: any } | null
}

/**
 * Create a new user or resend OTP if the email is already registered.
 *
 * @param {Object} data - User data including firstName, lastName, email, password, phoneNumber.
 * @param {string} data.firstName - The first name of the user.
 * @param {string} data.lastName - The last name of the user.
 * @param {string} data.email - The email address of the user.
 * @param {string} data.password - The password of the user.
 * @param {string} data.phoneNumber - The phone number of the user.
 *
 * @returns {Object} - Standardized response object with status, error, message, and data properties.
 * @returns {number} data.status - HTTP status code.
 * @returns {boolean} data.error - Indicates whether an error occurred.
 * @returns {string} data.message - Descriptive message about the operation.
 * @returns {Object|null} data.data - Additional data related to the operation, may be null.
 * @returns {string} data.data.email - The email address associated with the operation.
 *
 * @example
 * const userData: CreateUserData = {
 *   firstName: "Sabiya",
 *   lastName: "Abraham",
 *   email: "sabiya.Abraham@example.com",
 *   password: "securePassword",
 *   phoneNumber: "1234567890",
 * };
 * const result: CreateResponse = await create(userData);
 * console.log(result);
 */
export const create = async (
  data: CreateUserData,
  req: Request,
): Promise<CreateResponse> => {
  try {
    // Filter out unnecessary fields
    const filteredBody = filterObj(
      req.query,
      'firstName',
      'lastName',
      'email',
      'dob',
      'age',
      'password',
      'phoneNumber',
    )
    const { firstName, lastName, email } = filteredBody

    // Check if the user with the given email already exists
    const existingUser = await User.findOne({ email: email })

    if (existingUser) {
      // User found
      if (existingUser.verified) {
        // User already verified
        return {
          status: 200,
          error: true,
          message: 'Email already in use, Please login.',
          data: { email },
        }
      } else {
        // User found but not verified
        // @ts-ignore
        if (existingUser.otp_attempts < 6) {
          // Send OTP and update attempts
          const mailData = await MAIL.sendOTP(`${firstName} ${lastName}`, email)

          if (mailData.error) {
            return {
              status: 500,
              error: true,
              message: mailData.message,
              data: { errorDetails: mailData.data },
            }
          }

          existingUser.set({
            ...filteredBody,
            otp: mailData.data,
          })

          // @ts-ignore
          await existingUser.save({ new: true, validateModifiedOnly: true })

          return {
            status: 200,
            error: false,
            message: 'OTP sent successfully',
            data: { email },
          }
        } else {
          // OTP attempts exceeded
          // @ts-ignore
          if (Date.now() <= existingUser.otp_request_date) {
            // Calculate and return time balance in hours and minutes format
            const timeBalance = calculateTimeBalance(
              existingUser.otp_request_date,
            )

            return {
              status: 400,
              error: true,
              message: `Maximum OTP attempts reached for today, Try after ${timeBalance.hours} hr ${timeBalance.minutes} min`,
              data: null,
            }
          } else {
            const mailData = await MAIL.sendOTP(
              `${firstName} ${lastName}`,
              email,
            )

            if (mailData.error) {
              return {
                status: 500,
                error: true,
                message: mailData.message,
                data: { errorDetails: mailData.data },
              }
            }

            // Reset attempts for a new day
            existingUser.set({
              ...filteredBody,
              otp: mailData.data,
            })

            // @ts-ignore
            await existingUser.save({ new: true, validateModifiedOnly: true })

            return {
              status: 200,
              error: false,
              message: 'OTP sent successfully',
              data: { email },
            }
          }
        }
      }
    } else {
      // No user found, create a new user
      const newUser = await User.create(filteredBody)

      // Send OTP and update attempts
      const mailData = await MAIL.sendOTP(`${firstName} ${lastName}`, email)
      if (mailData.error) {
        return {
          status: 500,
          error: true,
          message: mailData.message,
          data: { errorDetails: mailData.data },
        }
      }

      newUser.set({
        ...filteredBody,
        otp: mailData.data,
      })

      // @ts-ignore
      await newUser.save({ new: true, validateModifiedOnly: true })

      return {
        status: 200,
        error: false,
        message: 'OTP sent successfully',
        data: { email },
      }
    }
  } catch (error: any) {
    return {
      status: 500,
      error: true,
      message: `Internal Server Error`,
      // @ts-ignore
      data: { errorDetails: error.message || '' },
    }
  }
}

function calculateTimeBalance(otpRequestDate: Date | undefined) {
  // Your implementation for calculating time balance goes here
  // This function is not provided in the original code
  // You may need to create it based on your specific requirements
  return { hours: 0, minutes: 0 }
}

/**
 * Verify user email by validating the provided OTP.
 *
 * @param {Object} data - User data including email and OTP.
 * @param {string} data.email - The email address of the user.
 * @param {string} data.otp - The OTP (One-Time Password) to be verified.
 *
 * @returns {Object} - Standardized response object.
 * @returns {number} data.status - HTTP status code.
 * @returns {boolean} data.error - Indicates whether an error occurred.
 * @returns {string} data.message - Descriptive message about the operation.
 * @returns {string|null} data.data - Additional data related to the operation, may be null.
 *
 * @example
 * const verificationData = {
 *   email: "sabiya.abraham@example.com",
 *   otp: "123456",
 * };
 * const result = await verify(verificationData);
 * console.log(result);
 */

interface VerifyData {
  email: string
  otp: string
}

interface VerifyResponse {
  status: number
  error: boolean
  message: string
  data: null
}

export const verify = async (
  data: VerifyData,
  req: Request,
): Promise<VerifyResponse> => {
  try {
    // Destructure data for easier access
    const { email, otp } = data

    // Find the user with the provided email
    const user = await User.findOne({ email })

    // Check if the user exists
    if (!user) {
      return {
        status: 400,
        error: true,
        message: 'Invalid email address',
        data: null,
      }
    }

    if (user.verified) {
      return {
        status: 400,
        error: true,
        message: 'Email is already verified',
        data: null,
      }
    }

    // @ts-ignore
    if (user.otp_expiry_time <= Date.now()) {
      return {
        status: 400,
        error: true,
        message: 'OTP expired',
        data: null,
      }
    }

    // @ts-ignore
    if (user.otp_verify_attempts >= 6 || user.otp_attempts >= 6) {
      return {
        status: 400,
        error: true,
        message: 'Maximum attempts reached',
        data: null,
      }
    }

    // Check if the provided OTP is incorrect
    // @ts-ignore
    if (!(await user.correctOTP(otp, user.otp))) {
      // Increment OTP verification attempts if OTP is incorrect
      user.otp_verify_attempts = (user.otp_verify_attempts || 0) + 1
      // @ts-ignore
      await user.save({ new: true, validateModifiedOnly: true })

      return {
        status: 400,
        error: true,
        message: 'Incorrect OTP',
        data: null,
      }
    }

    // Mark the user as verified, clear OTP, and save changes
    user.verified = true
    user.otp = undefined

    // @ts-ignore
    await user.save({ new: true, validateModifiedOnly: true })

    // Send a confirmation email
    await MAIL.accountCreated(`${user.firstName} ${user.lastName}`, user.email)

    return {
      status: 200,
      error: false,
      message: 'Account successfully verified. Please login with ' + user.email,
      data: null,
    }
  } catch (error: any) {
    // Return a standardized error response with the actual error message
    return {
      status: 500,
      error: true,
      message: 'Internal Server Error',
      data: error.message || 'Unknown error',
    }
  }
}

/**
 * Resend OTP to a user who has not yet verified their email.
 *
 * @param {Object} data - User data including email.
 * @param {string} data.email - The email address of the user.
 *
 * @returns {Object} - Standardized response object with status, error, message, and data properties.
 * @returns {number} data.status - HTTP status code.
 * @returns {boolean} data.error - Indicates whether an error occurred.
 * @returns {string} data.message - Descriptive message about the operation.
 * @returns {Object|null} data.data - Additional data related to the operation, may be null.
 * @returns {string} data.data.email - The email address associated with the operation.
 *
 * @example
 * const result = await reRequest({ email: "sabiya.abraham@example.com" });
 * console.log(result);
 */
interface ReRequestData {
  email: string
}

interface ReRequestResponse {
  status: number
  error: boolean
  message: string
  data: { email?: string; errorDetails?: any } | null
}

export const reRequest = async (
  data: ReRequestData,
  req: Request,
): Promise<ReRequestResponse> => {
  try {
    const { email } = data

    // Find the user with the provided email
    const user = await User.findOne({ email })

    // Check if the user exists
    if (!user) {
      return {
        status: 400,
        error: true,
        message: 'Invalid email address',
        data: null,
      }
    }

    if (user.verified) {
      return {
        status: 400,
        error: true,
        message: 'Email is already verified',
        data: null,
      }
    }

    // @ts-ignore
    if (user.otp_attempts >= 6) {
      // @ts-ignore
      if (Date.now() <= user.otp_request_date) {
        // Calculate and return time balance in hours and minutes format
        const timeBalance = calculateTimeBalance(user.otp_request_date)

        return {
          status: 400,
          error: true,
          message: `Maximum OTP attempts reached for today, Try after ${timeBalance.hours} hr ${timeBalance.minutes} min`,
          data: null,
        }
      }
    }

    // Send a new OTP to the user's email
    const mailData = await MAIL.sendOTP(
      `${user.firstName} ${user.lastName}`,
      user.email,
    )

    // Handle errors in sending OTP
    if (mailData.error) {
      return {
        status: 500,
        error: true,
        message: mailData.message,
        data: mailData.data,
      }
    }

    // Update user's OTP details and reset attempts
    user.otp = mailData.data

    // @ts-ignore
    await user.save({ new: true, validateModifiedOnly: true })

    // Return success message
    return {
      status: 200,
      error: false,
      message: 'New OTP sent successfully',
      data: { email },
    }
  } catch (error: any) {
    // Handle internal server error
    return {
      status: 500,
      error: true,
      message: 'Internal Server Error',
      data: { errorDetails: error.message || '' },
    }
  }
}

/**
 * Reset user information for a user who has not yet verified their email.
 *
 * @param {Object} data - User data including email.
 * @param {string} data.email - The email address of the user.
 *
 * @returns {Object} - Standardized response object with status, error, message, and data properties.
 * @returns {number} data.status - HTTP status code.
 * @returns {boolean} data.error - Indicates whether an error occurred.
 * @returns {string} data.message - Descriptive message about the operation.
 * @returns {Object|null} data.data - Additional data related to the operation, may be null.
 * @returns {string} data.data.email - The email address associated with the operation.
 *
 * @example
 * const result = await reSetUser({ email: "sabiya.abraham@example.com" });
 * console.log(result);
 */
interface ReSetUserData {
  email: string
}

interface ReSetUserResponse {
  status: number
  error: boolean
  message: string
  data: { errorDetails: any } | null
}

export const reSetUser = async (
  data: ReSetUserData,
  req: Request,
): Promise<ReSetUserResponse> => {
  try {
    const { email } = data

    // Find the user with the provided email
    const user = await User.findOne({ email })

    // Check if the user exists
    if (!user) {
      return {
        status: 400,
        error: true,
        message: 'Invalid email address',
        data: null,
      }
    }

    if (user.verified) {
      return {
        status: 400,
        error: true,
        message: 'Email is already verified, cannot reset user information',
        data: null,
      }
    }

    await user.remove()

    return {
      status: 200,
      error: false,
      message: 'User information reset successfully',
      data: null,
    }
  } catch (error: any) {
    // Handle internal server error
    return {
      status: 500,
      error: true,
      message: 'Internal Server Error',
      data: { errorDetails: error.message },
    }
  }
}

/**
 * Authenticate user login.
 *
 * @param {Object} data - User login data including email, password, and device information.
 * @param {string} data.email - The email address of the user.
 * @param {string} data.password - The password provided by the user.
 * @param {Object} data.deviceData - Information about the device used for login.
 *
 * @returns {Object} - Standardized response object with status, error, message, and data properties.
 * @returns {number} data.status - HTTP status code.
 * @returns {boolean} data.error - Indicates whether an error occurred.
 * @returns {string} data.message - Descriptive message about the operation.
 * @returns {Object|null} data.data - Additional data related to the operation, may be null.
 * @returns {string} data.data.token - Authentication token for the user session.
 * @returns {string} data.data.email - The email address associated with the user.
 *
 * @example
 * const loginData = {
 *   email: "sabiya.abraham@example.com",
 *   password: "password123",
 *   deviceData: {
 *     // Device information
 *   }
 * };
 * const result = await login(loginData);
 * console.log(result);
 */
interface LoginData {
  email: string
  password: string
  deviceData: any // Replace with actual type for deviceData
}

interface LoginResponse {
  status: number
  error: boolean
  message: string
  data: { token: string; email: string, device: any, role: String } | null
}

export const login = async (
  data: LoginData,
  req: Request,
): Promise<LoginResponse> => {
  try {
    const filteredBody = filterObj(req.query, 'email', 'password', 'deviceData', 'role')
    const { email, password, role, deviceData } = filteredBody

    // Check if the user exists
    // @ts-ignore
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return {
        status: 400,
        error: true,
        message: 'User not found. Please sign up.',
        data: null,
      }
    }

    if (user.deleted) {
      return {
        status: 400,
        error: true,
        message: 'Account is deleted and not available for login.',
        data: null,
      }
    }

    if (user.blocked) {
      return {
        status: 400,
        error: true,
        message: 'Account is blocked and not available for login.',
        data: null,
      }
    }

    if (!user.verified) {
      return {
        status: 400,
        error: true,
        message: 'Account is not verified and not available for login.',
        data: null,
      }
    }

    if (user.role !== role) {
      return {
        status: 400,
        error: true,
        message: 'User role does not match.',
        data: null,
      }
    }

    if (!(await user.correctPassword(password, user.password))) {
      return {
        status: 400,
        error: true,
        message: 'Incorrect password.',
        data: null,
      }
    }

    // If the user is valid, generate a token and send OTP for device verification
    const token = signToken(user._id, email)

    // Create a new device with a unique name using unique-names-generator
    const deviceName = uniqueNamesGenerator({
      dictionaries: [names, colors, adjectives, animals],
      separator: '-',
      length: 2,
      style: 'upperCase',
    })

    const mailData = await MAIL.sendDevice(
      user.firstName + ' ' + user.lastName,
      user.email,
      deviceData,
    )

    if (mailData.error) {
      return {
        status: 500,
        error: true,
        message: mailData.message,
        data: null,
      }
    }

    const device = await Device.create({
      name: deviceName,
      token: token,
      user: user._id,
      verified: true,
      otp: mailData.data,
      ...deviceData,
    })

    return {
      status: 200,
      error: false,
      message: 'Account login ',
      data: { token, email: user.email, device: device._id, role },
    }
  } catch (error: any) {
    console.error(error)
    return {
      status: 500,
      error: true,
      message: 'Internal Server Error',
      data: error.message || '',
    }
  }
}

/**
 * Verify user login with OTP.
 *
 * @param {Object} data - Verification data including authentication token and OTP.
 * @param {string} data.token - Authentication token for the user session.
 * @param {string} data.otp - One-Time Password (OTP) provided by the user.
 *
 * @returns {Object} - Standardized response object with status, error, message, and data properties.
 * @returns {number} data.status - HTTP status code.
 * @returns {boolean} data.error - Indicates whether an error occurred.
 * @returns {string} data.message - Descriptive message about the operation.
 * @returns {Object|null} data.data - Additional data related to the operation, may be null.
 *
 * @example
 * const verificationData = {
 *   token: "authentication_token",
 *   otp: "123456",
 * };
 * const result = await verifyLogin(verificationData);
 * console.log(result);
 */
interface VerifyLoginData {
  token: string
  otp: string
}

interface VerifyLoginResponse {
  status: number
  error: boolean
  message: string
  data: null
}

export const verifyLogin = async (
  data: VerifyLoginData,
  req: Request,
): Promise<VerifyLoginResponse> => {
  try {
    const { token, otp } = data

    let decoded

    try {
      // Verify the authentication token
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken
    } catch (error: any) {
      // Handle JWT verification errors
      if (error.name === 'JsonWebTokenError') {
        return {
          status: 400,
          error: true,
          message: 'Invalid token.',
          data: null,
        }
      }

      if (error.name === 'TokenExpiredError') {
        return {
          status: 400,
          error: true,
          message: 'Token has expired.',
          data: null,
        }
      }

      // Handle other JWT verification errors if needed

      return {
        status: 500,
        error: true,
        message: 'Internal Server Error',
        data: error.message || '',
      }
    }

    // Check if the user exists
    // @ts-ignore
    const user = await User.findOne({ email: decoded.email })

    if (!user) {
      return {
        status: 400,
        error: true,
        message: 'User not found. Token error',
        data: null,
      }
    }

    if (user.deleted) {
      return {
        status: 400,
        error: true,
        message: 'Account is deleted and not available for login.',
        data: null,
      }
    }

    if (user.blocked) {
      return {
        status: 400,
        error: true,
        message: 'Account is blocked and not available for login.',
        data: null,
      }
    }

    if (!user.verified) {
      return {
        status: 400,
        error: true,
        message: 'Account is not verified and not available for login.',
        data: null,
      }
    }

    // Continue with the code using the decoded token
    if (decoded.id !== user._id.toString()) {
      return {
        status: 400,
        error: true,
        message: 'Invalid token.',
        data: null,
      }
    }

    // Verify the user's device
    const device = await Device.findOne({
      user: user._id,
      token,
    })

    if (!device) {
      return {
        status: 400,
        error: true,
        message: 'Invalid device.',
        data: null,
      }
    }

    if (device.verified) {
      return {
        status: 400,
        error: true,
        message: 'Device is already verified',
        data: null,
      }
    }

    // @ts-ignore
    if (device.otp_verify_attempts >= 6 || device.otp_attempts >= 6) {
      return {
        status: 400,
        error: true,
        message: 'Maximum attempts reached',
        data: null,
      }
    }

    // @ts-ignore
    if (device.otp_expiry_time <= Date.now()) {
      return {
        status: 400,
        error: true,
        message: 'OTP expired',
        data: null,
      }
    }

    // Check if the provided OTP is incorrect
    // @ts-ignore
    if (!(await device.correctOTP(otp, device.otp))) {
      // Increment OTP verification attempts if OTP is incorrect
      device.otp_verify_attempts = (device.otp_verify_attempts || 0) + 1
      // @ts-ignore
      await device.save({ new: true, validateModifiedOnly: true })

      return {
        status: 400,
        error: true,
        message: 'Incorrect OTP',
        data: null,
      }
    }

    // Mark the device as verified
    device.verified = true
    device.otp = undefined
    // @ts-ignore
    await device.save({ new: true, validateModifiedOnly: true })

    const mailData = await MAIL.sendDevice(
      user.firstName + ' ' + user.lastName,
      user.email,
      device,
    )

    return {
      status: 200,
      error: false,
      message: 'Device verified successfully.',
      data: null,
    }
  } catch (error: any) {
    return {
      status: 500,
      error: true,
      message: 'Internal Server Error',
      data: error.message || '',
    }
  }
}

/**
 * Resend OTP to a user's device for verification.
 *
 * @param {Object} data - Device data including user email and device token.
 * @param {string} data.email - The email address associated with the user.
 * @param {string} data.token - Token associated with the user's device.
 *
 * @returns {Object} - Standardized response object with status, error, message, and data properties.
 * @returns {number} data.status - HTTP status code.
 * @returns {boolean} data.error - Indicates whether an error occurred.
 * @returns {string} data.message - Descriptive message about the operation.
 * @returns {Object|null} data.data - Additional data related to the operation, may be null.
 * @returns {string} data.data.email - The email address associated with the operation.
 *
 * @example
 * const result = await deviceResendOTP({ email: "sabiya.abraham@example.com", token: "device_token" });
 * console.log(result);
 */
interface DeviceResendOTPData {
  email: string
  token: string
}

interface DeviceResendOTPResponse {
  status: number
  error: boolean
  message: string
  data: { email?: string; errorDetails?: any } | null
}

export const deviceResendOTP = async (
  data: DeviceResendOTPData,
  req: Request,
): Promise<DeviceResendOTPResponse> => {
  try {
    const { email, token } = data

    // Find the user with the provided email
    const user = await User.findOne({ email })

    // Check if the user exists
    if (!user) {
      return {
        status: 400,
        error: true,
        message: 'Invalid email address',
        data: null,
      }
    }

    // Find the user's device with the provided token
    const device = await Device.findOne({ user: user._id, token })

    // Check if the device exists
    if (!device) {
      return {
        status: 400,
        error: true,
        message: 'Invalid device',
        data: null,
      }
    }

    // Check if the device is already verified
    if (device.verified) {
      return {
        status: 400,
        error: true,
        message: 'Device is already verified',
        data: null,
      }
    }

    // Check if the device has reached maximum OTP attempts
    // @ts-ignore
    if (device.otp_attempts >= 6) {
      // @ts-ignore
      if (Date.now() <= device.otp_request_date) {
        // Calculate and return time balance in hours and minutes format
        const timeBalance = calculateTimeBalance(device.otp_request_date)

        return {
          status: 400,
          error: true,
          message: `Maximum OTP attempts reached for today, Try after ${timeBalance.hours} hr ${timeBalance.minutes} min`,
          data: null,
        }
      }
    }

    // Send a new OTP to the user's device
    const mailData = await MAIL.sendDeviceOTP(
      `${user.firstName} ${user.lastName}`,
      user.email,
      device,
    )

    // Handle errors in sending OTP
    if (mailData.error) {
      return {
        status: 500,
        error: true,
        message: mailData.message,
        data: mailData.data,
      }
    }

    // Update device's OTP details and reset attempts
    device.otp = mailData.data
    // @ts-ignore
    await device.save({ new: true, validateModifiedOnly: true })

    // Return success message
    return {
      status: 200,
      error: false,
      message: 'New OTP sent to device successfully',
      data: { email },
    }
  } catch (error: any) {
    // Handle internal server error
    return {
      status: 500,
      error: true,
      message: 'Internal Server Error',
      data: { errorDetails: error.message || '' },
    }
  }
}

/**
 * Logout a user's device based on the authentication token.
 *
 * @param {Object} data - User data including authentication token.
 * @param {string} data.token - The authentication token representing the device session.
 *
 * @returns {Object} - Standardized response object with status, error, message, and data properties.
 * @returns {number} data.status - HTTP status code.
 * @returns {boolean} data.error - Indicates whether an error occurred.
 * @returns {string} data.message - Descriptive message about the operation.
 * @returns {Object|null} data.data - Additional data related to the operation, may be null.
 * @returns {string} data.data.email - The email address associated with the operation.
 * @returns {string} data.data.token - The authentication token of the logged-out device.
 *
 * @example
 * const result = await logoutDevice({ email: "sabiya.abraham@example.com", token: "authentication_token" });
 * console.log(result);
 */
interface LogoutDeviceData {
  token: string
}

interface LogoutDeviceResponse {
  status: number
  error: boolean
  message: string
  data: { email?: string; token?: string; errorDetails?: any } | null
}

export const logoutDevice = async (
  data: LogoutDeviceData,
  req: Request,
): Promise<LogoutDeviceResponse> => {
  try {
    const { token } = data

    let decoded

    try {
      // Verify the authentication token
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error: any) {
      // Handle JWT verification errors
      if (error.name === 'JsonWebTokenError') {
        return {
          status: 400,
          error: true,
          message: 'Invalid token.',
          data: null,
        }
      }

      if (error.name === 'TokenExpiredError') {
        return {
          status: 400,
          error: true,
          message: 'Token has expired.',
          data: null,
        }
      }

      // Handle other JWT verification errors if needed

      return {
        status: 500,
        error: true,
        message: 'Internal Server Error',
        data: error.message || '',
      }
    }

    // Check if the user exists
    // @ts-ignore
    const user = await User.findOne({ email: decoded.email })

    if (!user) {
      return {
        status: 400,
        error: true,
        message: 'User not found. Token error',
        data: null,
      }
    }

    if (user.deleted) {
      return {
        status: 400,
        error: true,
        message: 'Account is deleted',
        data: null,
      }
    }

    if (user.blocked) {
      return {
        status: 400,
        error: true,
        message: 'Account is blocked.',
        data: null,
      }
    }

    if (!user.verified) {
      return {
        status: 400,
        error: true,
        message: 'Account is not verified.',
        data: null,
      }
    }

    // Continue with the code using the decoded token
    // @ts-ignore
    if (decoded.id !== user._id.toString()) {
      return {
        status: 400,
        error: true,
        message: 'Invalid token.',
        data: null,
      }
    }

    // Find the device by the authentication token and perform logout logic
    const device = await Device.findOne({ user: user._id, token })

    // Check if the device exists
    if (!device) {
      return {
        status: 400,
        error: true,
        message: 'Invalid authentication token',
        data: null,
      }
    }

    // Implement your logout logic here (e.g., updating device status, revoking tokens)
    await device.remove()

    return {
      status: 200,
      error: false,
      message: 'Device logged out successfully',
      data: null,
    }
  } catch (error: any) {
    // Handle internal server error
    return {
      status: 500,
      error: true,
      message: 'Internal Server Error',
      data: { errorDetails: error.message || '' },
    }
  }
}

/**
 * Protect User or Admin.
 *
 * @param {Object} data - User or Admin data including authentication token.
 * @param {string} data.token - The authentication token representing the user or admin session.
 * @param {string} data.email - The email address of the user or admin.
 * @param {string} data.id - The user or admin ID.
 * @param {string} data.deviceID - The device ID.
 *
 * @returns {Object} - Standardized response object with status, error, message, and data properties.
 * @returns {number} data.status - HTTP status code.
 * @returns {boolean} data.error - Indicates whether an error occurred.
 * @returns {string} data.message - Descriptive message about the operation.
 * @returns {Object|null} data.data - Additional data related to the operation, may be null.
 * @returns {Object} data.data.user - User or Admin information.
 * @returns {Object} data.data.device - Device information.
 *
 * @example
 * const protectData = { token: "authentication_token", email: "sabiya.abraham@example.com", id: "user_id", deviceID: "device_id" };
 * const result = await protectUser(protectData);
 * console.log(result);
 */
interface ProtectData {
  token?: string
  email?: string
  id?: string
  deviceID?: string
}

interface ProtectResponse {
  status: number
  error: boolean
  message: string
  data: { user: object; device: object } | null
}

export const protectUser = async (
  data: ProtectData,
): Promise<ProtectResponse> => {
  try {
    const { token, email, id, deviceID } = data

    // Check if the user exists
    const user = await User.findOne({ email })

    // @ts-ignore
    const protect_info = await protect(user)

    if (protect_info.error) return protect_info

    // Continue with the code using the decoded token
    // @ts-ignore
    if (id !== user._id.toString()) {
      return {
        status: 400,
        error: true,
        message: 'Invalid token.',
        data: null,
      }
    }

    // Verify the user's device
    const device = await Device.findOne({
      // @ts-ignore
      user: user._id,
      token,
    })

    if (!device) {
      return {
        status: 400,
        error: true,
        message: 'Invalid device.',
        data: null,
      }
    }

    if (!device.verified) {
      return {
        status: 400,
        error: true,
        message: 'Device not verified.',
        data: null,
      }
    }

    return {
      status: 200,
      error: false,
      message: 'Device verified successfully.',
      // @ts-ignore
      data: { user, device },
    }
  } catch (error: any) {
    return {
      status: 500,
      error: true,
      message: 'Internal Server Error',
      data: error.message || '',
    }
  }
}

/**
 * Protect Admin.
 *
 * @param {Object} data - Admin data including authentication token.
 * @param {string} data.token - The authentication token representing the admin session.
 * @param {string} data.email - The email address of the admin.
 * @param {string} data.id - The admin ID.
 * @param {string} data.deviceID - The device ID.
 *
 * @returns {Object} - Standardized response object with status, error, message, and data properties.
 * @returns {number} data.status - HTTP status code.
 * @returns {boolean} data.error - Indicates whether an error occurred.
 * @returns {string} data.message - Descriptive message about the operation.
 * @returns {Object|null} data.data - Additional data related to the operation, may be null.
 * @returns {Object} data.data.admin - Admin information.
 * @returns {Object} data.data.device - Device information.
 *
 * @example
 * const protectData = { token: "authentication_token", email: "admin@example.com", id: "admin_id", deviceID: "device_id" };
 * const result = await protectAdmin(protectData);
 * console.log(result);
 */
interface ProtectAdminData {
  token?: string
  email?: string
  id?: string
  deviceID?: string
}

interface ProtectAdminResponse {
  status: number
  error: boolean
  message: string
  data: { admin: object; device: object } | null
}

export const protectAdmin = async (
  data: ProtectAdminData,
): Promise<ProtectAdminResponse> => {
  try {
    const { token, email, id, deviceID } = data

    // Check if the admin exists
    const admin = await Admin.findOne({ email })

    if (!admin) {
      return {
        status: 400,
        error: true,
        message: 'Admin not found. Token error',
        data: null,
      }
    }

    // @ts-ignore
    const protect_info = await protect(admin)

    if (protect_info.error) return protect_info

    // Continue with the code using the decoded token
    if (id !== admin._id.toString()) {
      return {
        status: 400,
        error: true,
        message: 'Invalid token.',
        data: null,
      }
    }

    // Verify the admin's device
    const device = await Device.findOne({
      user: admin._id,
      token,
    })

    if (!device) {
      return {
        status: 400,
        error: true,
        message: 'Invalid device.',
        data: null,
      }
    }

    if (!device.verified) {
      return {
        status: 400,
        error: true,
        message: 'Device not verified.',
        data: null,
      }
    }

    return {
      status: 200,
      error: false,
      message: 'Device verified successfully.',
      data: { admin, device },
    }
  } catch (error: any) {
    return {
      status: 500,
      error: true,
      message: 'Internal Server Error',
      data: error.message || '',
    }
  }
}

/**
 * Forgot Password.
 *
 * @param {Object} data - Data including user email.
 * @param {string} data.email - The email address of the user.
 *
 * @returns {Object} - Standardized response object with status, error, message, and data properties.
 * @returns {number} data.status - HTTP status code.
 * @returns {boolean} data.error - Indicates whether an error occurred.
 * @returns {string} data.message - Descriptive message about the operation.
 * @returns {Object|null} data.data - Additional data related to the operation, may be null.
 *
 * @example
 * const forgotPasswordData = { email: "sabiya.abraham@example.com" };
 * const result = await forgotPassword(forgotPasswordData);
 * console.log(result);
 */
interface ForgotPasswordData {
  email: string
}

interface ForgotPasswordResponse {
  status: number
  error: boolean
  message: string
  data: null
}

export const forgotPassword = async (
  data: ForgotPasswordData,
  req: Request,
  // @ts-ignore
): Promise<ForgotPasswordResponse> => {
  // TODO: forgotPassword function
  // ...
}

/**
 * Verify Forgot Password.
 *
 * @param {Object} data - Data including user email and verification code.
 * @param {string} data.email - The email address of the user.
 * @param {string} data.code - The verification code sent to the user.
 *
 * @returns {Object} - Standardized response object with status, error, message, and data properties.
 * @returns {number} data.status - HTTP status code.
 * @returns {boolean} data.error - Indicates whether an error occurred.
 * @returns {string} data.message - Descriptive message about the operation.
 * @returns {Object|null} data.data - Additional data related to the operation, may be null.
 *
 * @example
 * const verifyForgotPasswordData = { email: "sabiya.abraham@example.com", code: "123456" };
 * const result = await verifyForgotPassword(verifyForgotPasswordData);
 * console.log(result);
 */
interface VerifyForgotPasswordData {
  email: string
  code: string
}

interface VerifyForgotPasswordResponse {
  status: number
  error: boolean
  message: string
  data: null
}

// export const verifyForgotPassword = async (
//   data: VerifyForgotPasswordData,
//   req: Request,
// ): Promise<VerifyForgotPasswordResponse> => {
//   // TODO: verifyForgotPassword function
//   // ...
// }

/**
 * Reset Password.
 *
 * @param {Object} data - Data including user email and new password.
 * @param {string} data.email - The email address of the user.
 * @param {string} data.password - The new password for the user.
 *
 * @returns {Object} - Standardized response object with status, error, message, and data properties.
 * @
 */

/**
 * @description      : user controller
 * @author           : Sabiya Abraham
 * @group            : Team MEDONMA
 * @created          : 27/01/2024 - 13:49:23
 *
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 27/01/2024
 * - Author          : Sabiya Abraham
 * - Modification    :
 **/

import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import handleResponse from '../lib/handleResponse'
import * as authService from '../services/authService'
import * as userService from '../services/userService'

const {
  create: create_,
  verify: verify_,
  reRequest: reRequest_,
  reSetUser: reSetUser_,
  login: login_,
  verifyLogin: verifyLogin_,
  deviceResendOTP: deviceResendOTP_,
  logoutDevice: logoutDevice_,
  forgotPassword: forgotPassword_,
  // verifyForgotPassword: verifyForgotPassword_,
  // reSetPassword: reSetPassword_,
  // reRequestReSetPassword: reRequestReSetPassword_,
} = authService

const {
  userInfo: userInfo_,
  updateInfo: updateInfo_,
  updatePic: updatePic_,
  removeProfile: removeProfile_,
} = userService

/**
 * Creates a new item
 * @param req - The request object
 * @param res - The response object
 * @returns A promise with the result
 */
export const create = asyncHandler(
  async (req: Request, res: Response): Promise<any> =>
    await handleResponse(create_(req.body, req), res),
)

/**
 * Verify function
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<any>} - The response promise
 */
export const verify = asyncHandler(
  async (req: Request, res: Response): Promise<any> =>
    await handleResponse(verify_(req.body, req), res),
)

/**
 * Asynchronous handler for reRequest function
 *
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<any>} - The asynchronous result
 */
export const reRequest = asyncHandler(
  async (req: Request, res: Response): Promise<any> =>
    await handleResponse(reRequest_(req.body, req), res),
)

/**
 * Handles the user reset functionality
 *
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<any>} A promise that resolves when the user reset is handled
 */
export const reSetUser = asyncHandler(
  async (req: Request, res: Response): Promise<any> =>
    await handleResponse(reSetUser_(req.body, req), res),
)

/**
 * Handles the login request
 *
 * @param req - the request object
 * @param res - the response object
 * @returns a promise with the response data
 */
export const login = asyncHandler(
  async (req: Request, res: Response): Promise<any> =>
    // Await the response from the login_ function with the request body and request object as parameters, then handle the response using the handleResponse function
    await handleResponse(login_(req.body, req), res),
)

/**
 * Handles verification of login
 * @param req - The request object
 * @param res - The response object
 * @returns A promise with the verification result
 */
export const verifyLogin = asyncHandler(
  async (req: Request, res: Response): Promise<any> =>
    await handleResponse(verifyLogin_(req.body, req), res),
)

/**
 * Resend OTP for a device
 * @param req - the request object
 * @param res - the response object
 * @returns a promise with the result
 */
export const deviceResendOTP = asyncHandler(
  async (req: Request, res: Response): Promise<any> =>
    await handleResponse(deviceResendOTP_(req.body, req), res),
)

/**
 * Logout device handler
 *
 * @param req - the request object
 * @param res - the response object
 * @returns a Promise
 */
export const logoutDevice = asyncHandler(
  async (req: Request, res: Response): Promise<any> =>
    await handleResponse(logoutDevice_(req.body, req), res),
)

// export const forgotPassword = asyncHandler(
//
//   async (req: Request, res: Response): Promise<any> =>
//await
//     handleResponse(forgotPassword_(req.body, req), res),
// )

//
// export const verifyForgotPassword = asyncHandler(
//   async (req: Request, res: Response): Promise<any> =>
//await
//     handleResponse(verifyForgotPassword(req.body, req), res),
// )

// export const reSetPassword = asyncHandler(async (req: Request, res: Response): Promise<any> =>
//await
//   handleResponse(reSetPassword_(req.body, req), res),
// )

// export const reRequestReSetPassword = asyncHandler(
//
//   async (req: Request, res: Response): Promise<any> =>
//await
//     handleResponse(reRequestReSetPassword_(req.body, req), res),
// )

/**
 * Async handler for user information retrieval
 *
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<any>} The result of the user information retrieval
 */
export const userInfo = asyncHandler(
  async (req: Request, res: Response): Promise<any> =>
    await handleResponse(userInfo_(req.body, req), res),
)

/**
 * Updates the information
 * @param req - The request object
 * @param res - The response object
 * @returns A promise with the updated information
 */
export const updateInfo = asyncHandler(
  async (req: Request, res: Response): Promise<any> =>
    await handleResponse(updateInfo_(req.body, req), res),
)

/**
 * Update profile picture
 * @param req - The request object
 * @param res - The response object
 * @returns A promise with the updated picture
 */
export const updatePic = asyncHandler(
  async (req: Request, res: Response): Promise<any> =>
    await handleResponse(updatePic_(req.body, req), res),
)

/**
 * Handles the removal of a profile
 * @param req - the request object
 * @param res - the response object
 * @returns a Promise with the result of the removal operation
 */
export const removeProfile = asyncHandler(
  async (req: Request, res: Response): Promise<any> =>
    await handleResponse(removeProfile_(req.body, req), res),
)

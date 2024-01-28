/**
 * @description      : Auth Router
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
import { Router } from 'express'
import multer from 'multer'
import {
  create,
  verify,
  reRequest,
  reSetUser,
  login,
  verifyLogin,
  deviceResendOTP,
  logoutDevice,
  userInfo,
  updateInfo,
  updatePic,
  removeProfile,
} from '../controllers/userController'
import { protectUser } from '../middleware/authMiddleware'

const storage = multer.memoryStorage() // Use memory storage for multer
const upload = multer({ storage })
const router = Router()

router
  .route('/create')
  .get(create)
  .post(verify)
  .put(reRequest)
  .delete(reSetUser)

router
  .route('/login')
  .get(login)
  .post(verifyLogin)
  .put(deviceResendOTP)
  .delete(protectUser, logoutDevice)

// router
//   .route('/forgot-password')
//   .get(forgotPassword)
//   .post(verifyForgotPassword);

// router
//   .route('/reset-password')
//   .get(resetPassword)
//   .post(verifyResetPassword)
//   .put(reRequestResetPassword);

router
  .route('/account')
  .get(protectUser, userInfo)
  .post(protectUser, updateInfo)

router
  .route('/profile')
  .post(protectUser, upload.single('avatar'), updatePic)
  .delete(protectUser, removeProfile)

export default router

import { Router } from 'express'
import multer from 'multer'

/*
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
} from "../controllers/userController";
import { protectUser } from "../middleware/authMiddleware";
*/

const storage = multer.memoryStorage()
const upload = multer({ storage })
const router = Router()

router.route('/create').get(async (req, res) => {
  res.send('create')
})

export default router

'use strict'
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const express_1 = require('express')
const multer_1 = __importDefault(require('multer'))
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
const storage = multer_1.default.memoryStorage()
const upload = (0, multer_1.default)({ storage })
const router = (0, express_1.Router)()
router.route('/create').get((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    res.send('create')
  }),
)
exports.default = router

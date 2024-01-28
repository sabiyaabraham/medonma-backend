"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const storage = multer_1.default.memoryStorage(); // Use memory storage for multer
const upload = (0, multer_1.default)({ storage });
const router = (0, express_1.Router)();
router
    .route('/create')
    .get(userController_1.create)
    .post(userController_1.verify)
    .put(userController_1.reRequest)
    .delete(userController_1.reSetUser);
router
    .route('/login')
    .get(userController_1.login)
    .post(userController_1.verifyLogin)
    .put(userController_1.deviceResendOTP)
    .delete(authMiddleware_1.protectUser, userController_1.logoutDevice);
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
    .get(authMiddleware_1.protectUser, userController_1.userInfo)
    .post(authMiddleware_1.protectUser, userController_1.updateInfo);
router
    .route('/profile')
    .post(authMiddleware_1.protectUser, upload.single('avatar'), userController_1.updatePic)
    .delete(authMiddleware_1.protectUser, userController_1.removeProfile);
exports.default = router;

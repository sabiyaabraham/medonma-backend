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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDevice = exports.sendDeviceOTP = exports.accountCreated = exports.sendOTP = void 0;
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
const nodemailer_1 = __importDefault(require("nodemailer"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const mail_1 = require("../Templates/mail");
class MAIL {
    constructor() {
        this.EMAIL = {
            user: process.env.EMAIL_ID || '',
            password: process.env.EMAIL_PASSWORD || '',
        };
        this.transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: this.EMAIL.user,
                pass: this.EMAIL.password,
            },
        });
    }
    sendMail(email, subject, content) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const info = yield this.transporter.sendMail({
                    from: `"🧑‍‍‍‍‍‍‍🏻 MEDONMA 🤖" <${this.EMAIL.user}>`,
                    to: email,
                    subject: subject,
                    text: 'CODE NOT SUPPORTED',
                    html: content,
                });
                return {
                    status: 200,
                    error: false,
                    message: 'Email sent successfully.',
                    data: info.messageId,
                };
            }
            catch (error) {
                return {
                    status: 500,
                    error: true,
                    message: 'Failed to send email.',
                    data: error.message || null,
                };
            }
        });
    }
}
const sendOTP = (name, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mail = new MAIL();
        const newOtp = otp_generator_1.default.generate(4, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
        });
        const username = name || email.split('@')[0];
        const content = yield (0, mail_1.otp)(username, newOtp.toString());
        const mailSendResult = yield mail.sendMail(email, `[ MEDONMA ] OTP for create your account: ${username}`, content);
        return {
            status: mailSendResult.status,
            error: mailSendResult.error,
            message: mailSendResult.message,
            data: newOtp.toString() || null,
        };
    }
    catch (error) {
        return {
            status: 500,
            error: true,
            message: 'Error on sending OTP email.',
            data: error.message || null,
        };
    }
});
exports.sendOTP = sendOTP;
const accountCreated = (name, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mail = new MAIL();
        const username = name || email.split('@')[0];
        const content = yield (0, mail_1.created)(username);
        const mailSendResult = yield mail.sendMail(email, `[MEDONMA] Account Created Successfully`, content);
        return {
            status: mailSendResult.status,
            error: mailSendResult.error,
            message: mailSendResult.message,
            data: null,
        };
    }
    catch (error) {
        return {
            status: 500,
            error: true,
            message: 'Error on sending account creation email.',
            data: error.message || null,
        };
    }
});
exports.accountCreated = accountCreated;
const sendDeviceOTP = (name, email, device) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mail = new MAIL();
        const newOtp = otp_generator_1.default.generate(4, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
        });
        const username = name || email.split('@')[0];
        const content = yield (0, mail_1.device_otp)(username, newOtp.toString(), device);
        const mailSendResult = yield mail.sendMail(email, `[MEDONMA] - OTP for New Device`, content);
        return {
            status: mailSendResult.status,
            error: mailSendResult.error,
            message: mailSendResult.message,
            data: newOtp.toString() || null,
        };
    }
    catch (error) {
        return {
            status: 500,
            error: true,
            message: 'Error on sending OTP email.',
            data: error.message || null,
        };
    }
});
exports.sendDeviceOTP = sendDeviceOTP;
const sendDevice = (name, email, device) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mail = new MAIL();
        const username = name || email.split('@')[0];
        const content = yield (0, mail_1.device_login)(username, device);
        const mailSendResult = yield mail.sendMail(email, `[MEDONMA] - New Device Login`, content);
        return {
            status: mailSendResult.status,
            error: mailSendResult.error,
            message: mailSendResult.message,
            data: null,
        };
    }
    catch (error) {
        return {
            status: 500,
            error: true,
            message: 'Error on sending OTP email.',
            data: error.message || null,
        };
    }
});
exports.sendDevice = sendDevice;
exports.default = {
    sendOTP: exports.sendOTP,
    accountCreated: exports.accountCreated,
    sendDeviceOTP: exports.sendDeviceOTP,
    sendDevice: exports.sendDevice,
};

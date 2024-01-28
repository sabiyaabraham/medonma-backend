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
exports.forgotPassword = exports.protectAdmin = exports.protectUser = exports.logoutDevice = exports.deviceResendOTP = exports.verifyLogin = exports.login = exports.reSetUser = exports.reRequest = exports.verify = exports.create = void 0;
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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const unique_names_generator_1 = require("unique-names-generator");
const filterObj_1 = __importDefault(require("../lib/filterObj"));
const mail_1 = __importDefault(require("../lib/mail"));
const Models_1 = require("../Models");
const protect_1 = __importDefault(require("../utils/protect"));
const JWT_SECRET = process.env.JWT_SECRET
    ? process.env.JWT_SECRET
    : 'medonma';
const signToken = (id, email) => jsonwebtoken_1.default.sign({ id, email }, JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
});
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
const create = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Filter out unnecessary fields
        const filteredBody = (0, filterObj_1.default)(req.query, 'firstName', 'lastName', 'email', 'dob', 'age', 'password', 'phoneNumber');
        const { firstName, lastName, email } = filteredBody;
        // Check if the user with the given email already exists
        const existingUser = yield Models_1.User.findOne({ email: email });
        if (existingUser) {
            // User found
            if (existingUser.verified) {
                // User already verified
                return {
                    status: 200,
                    error: true,
                    message: 'Email already in use, Please login.',
                    data: { email },
                };
            }
            else {
                // User found but not verified
                // @ts-ignore
                if (existingUser.otp_attempts < 6) {
                    // Send OTP and update attempts
                    const mailData = yield mail_1.default.sendOTP(`${firstName} ${lastName}`, email);
                    if (mailData.error) {
                        return {
                            status: 500,
                            error: true,
                            message: mailData.message,
                            data: { errorDetails: mailData.data },
                        };
                    }
                    existingUser.set(Object.assign(Object.assign({}, filteredBody), { otp: mailData.data }));
                    // @ts-ignore
                    yield existingUser.save({ new: true, validateModifiedOnly: true });
                    return {
                        status: 200,
                        error: false,
                        message: 'OTP sent successfully',
                        data: { email },
                    };
                }
                else {
                    // OTP attempts exceeded
                    // @ts-ignore
                    if (Date.now() <= existingUser.otp_request_date) {
                        // Calculate and return time balance in hours and minutes format
                        const timeBalance = calculateTimeBalance(existingUser.otp_request_date);
                        return {
                            status: 400,
                            error: true,
                            message: `Maximum OTP attempts reached for today, Try after ${timeBalance.hours} hr ${timeBalance.minutes} min`,
                            data: null,
                        };
                    }
                    else {
                        const mailData = yield mail_1.default.sendOTP(`${firstName} ${lastName}`, email);
                        if (mailData.error) {
                            return {
                                status: 500,
                                error: true,
                                message: mailData.message,
                                data: { errorDetails: mailData.data },
                            };
                        }
                        // Reset attempts for a new day
                        existingUser.set(Object.assign(Object.assign({}, filteredBody), { otp: mailData.data }));
                        // @ts-ignore
                        yield existingUser.save({ new: true, validateModifiedOnly: true });
                        return {
                            status: 200,
                            error: false,
                            message: 'OTP sent successfully',
                            data: { email },
                        };
                    }
                }
            }
        }
        else {
            // No user found, create a new user
            const newUser = yield Models_1.User.create(filteredBody);
            // Send OTP and update attempts
            const mailData = yield mail_1.default.sendOTP(`${firstName} ${lastName}`, email);
            if (mailData.error) {
                return {
                    status: 500,
                    error: true,
                    message: mailData.message,
                    data: { errorDetails: mailData.data },
                };
            }
            newUser.set(Object.assign(Object.assign({}, filteredBody), { otp: mailData.data }));
            // @ts-ignore
            yield newUser.save({ new: true, validateModifiedOnly: true });
            return {
                status: 200,
                error: false,
                message: 'OTP sent successfully',
                data: { email },
            };
        }
    }
    catch (error) {
        return {
            status: 500,
            error: true,
            message: `Internal Server Error`,
            // @ts-ignore
            data: { errorDetails: error.message || '' },
        };
    }
});
exports.create = create;
function calculateTimeBalance(otpRequestDate) {
    // Your implementation for calculating time balance goes here
    // This function is not provided in the original code
    // You may need to create it based on your specific requirements
    return { hours: 0, minutes: 0 };
}
const verify = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Destructure data for easier access
        const { email, otp } = data;
        // Find the user with the provided email
        const user = yield Models_1.User.findOne({ email });
        // Check if the user exists
        if (!user) {
            return {
                status: 400,
                error: true,
                message: 'Invalid email address',
                data: null,
            };
        }
        if (user.verified) {
            return {
                status: 400,
                error: true,
                message: 'Email is already verified',
                data: null,
            };
        }
        // @ts-ignore
        if (user.otp_expiry_time <= Date.now()) {
            return {
                status: 400,
                error: true,
                message: 'OTP expired',
                data: null,
            };
        }
        // @ts-ignore
        if (user.otp_verify_attempts >= 6 || user.otp_attempts >= 6) {
            return {
                status: 400,
                error: true,
                message: 'Maximum attempts reached',
                data: null,
            };
        }
        // Check if the provided OTP is incorrect
        // @ts-ignore
        if (!(yield user.correctOTP(otp, user.otp))) {
            // Increment OTP verification attempts if OTP is incorrect
            user.otp_verify_attempts = (user.otp_verify_attempts || 0) + 1;
            // @ts-ignore
            yield user.save({ new: true, validateModifiedOnly: true });
            return {
                status: 400,
                error: true,
                message: 'Incorrect OTP',
                data: null,
            };
        }
        // Mark the user as verified, clear OTP, and save changes
        user.verified = true;
        user.otp = undefined;
        // @ts-ignore
        yield user.save({ new: true, validateModifiedOnly: true });
        // Send a confirmation email
        yield mail_1.default.accountCreated(`${user.firstName} ${user.lastName}`, user.email);
        return {
            status: 200,
            error: false,
            message: 'Account successfully verified. Please login with ' + user.email,
            data: null,
        };
    }
    catch (error) {
        // Return a standardized error response with the actual error message
        return {
            status: 500,
            error: true,
            message: 'Internal Server Error',
            data: error.message || 'Unknown error',
        };
    }
});
exports.verify = verify;
const reRequest = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = data;
        // Find the user with the provided email
        const user = yield Models_1.User.findOne({ email });
        // Check if the user exists
        if (!user) {
            return {
                status: 400,
                error: true,
                message: 'Invalid email address',
                data: null,
            };
        }
        if (user.verified) {
            return {
                status: 400,
                error: true,
                message: 'Email is already verified',
                data: null,
            };
        }
        // @ts-ignore
        if (user.otp_attempts >= 6) {
            // @ts-ignore
            if (Date.now() <= user.otp_request_date) {
                // Calculate and return time balance in hours and minutes format
                const timeBalance = calculateTimeBalance(user.otp_request_date);
                return {
                    status: 400,
                    error: true,
                    message: `Maximum OTP attempts reached for today, Try after ${timeBalance.hours} hr ${timeBalance.minutes} min`,
                    data: null,
                };
            }
        }
        // Send a new OTP to the user's email
        const mailData = yield mail_1.default.sendOTP(`${user.firstName} ${user.lastName}`, user.email);
        // Handle errors in sending OTP
        if (mailData.error) {
            return {
                status: 500,
                error: true,
                message: mailData.message,
                data: mailData.data,
            };
        }
        // Update user's OTP details and reset attempts
        user.otp = mailData.data;
        // @ts-ignore
        yield user.save({ new: true, validateModifiedOnly: true });
        // Return success message
        return {
            status: 200,
            error: false,
            message: 'New OTP sent successfully',
            data: { email },
        };
    }
    catch (error) {
        // Handle internal server error
        return {
            status: 500,
            error: true,
            message: 'Internal Server Error',
            data: { errorDetails: error.message || '' },
        };
    }
});
exports.reRequest = reRequest;
const reSetUser = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = data;
        // Find the user with the provided email
        const user = yield Models_1.User.findOne({ email });
        // Check if the user exists
        if (!user) {
            return {
                status: 400,
                error: true,
                message: 'Invalid email address',
                data: null,
            };
        }
        if (user.verified) {
            return {
                status: 400,
                error: true,
                message: 'Email is already verified, cannot reset user information',
                data: null,
            };
        }
        yield user.remove();
        return {
            status: 200,
            error: false,
            message: 'User information reset successfully',
            data: null,
        };
    }
    catch (error) {
        // Handle internal server error
        return {
            status: 500,
            error: true,
            message: 'Internal Server Error',
            data: { errorDetails: error.message },
        };
    }
});
exports.reSetUser = reSetUser;
const login = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filteredBody = (0, filterObj_1.default)(req.query, 'email', 'password', 'deviceData');
        console.log('data', filteredBody);
        const { email, password, deviceData } = filteredBody;
        // Check if the user exists
        // @ts-ignore
        const user = yield Models_1.User.findOne({ email }).select('+password');
        if (!user) {
            return {
                status: 400,
                error: true,
                message: 'User not found. Please sign up.',
                data: null,
            };
        }
        if (user.deleted) {
            return {
                status: 400,
                error: true,
                message: 'Account is deleted and not available for login.',
                data: null,
            };
        }
        if (user.blocked) {
            return {
                status: 400,
                error: true,
                message: 'Account is blocked and not available for login.',
                data: null,
            };
        }
        if (!user.verified) {
            return {
                status: 400,
                error: true,
                message: 'Account is not verified and not available for login.',
                data: null,
            };
        }
        if (!(yield user.correctPassword(password, user.password))) {
            return {
                status: 400,
                error: true,
                message: 'Incorrect password.',
                data: null,
            };
        }
        // If the user is valid, generate a token and send OTP for device verification
        const token = signToken(user._id, email);
        // Create a new device with a unique name using unique-names-generator
        const deviceName = (0, unique_names_generator_1.uniqueNamesGenerator)({
            dictionaries: [unique_names_generator_1.names, unique_names_generator_1.colors, unique_names_generator_1.adjectives, unique_names_generator_1.animals],
            separator: '-',
            length: 2,
            style: 'upperCase',
        });
        const mailData = yield mail_1.default.sendDevice(user.firstName + ' ' + user.lastName, user.email, deviceData);
        if (mailData.error) {
            return {
                status: 500,
                error: true,
                message: mailData.message,
                data: null,
            };
        }
        const device = yield Models_1.Device.create(Object.assign({ name: deviceName, token: token, user: user._id, verified: true, otp: mailData.data }, deviceData));
        return {
            status: 200,
            error: false,
            message: 'OTP sent for device verification.',
            data: { token, email: user.email },
        };
    }
    catch (error) {
        console.error(error);
        return {
            status: 500,
            error: true,
            message: 'Internal Server Error',
            data: error.message || '',
        };
    }
});
exports.login = login;
const verifyLogin = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, otp } = data;
        let decoded;
        try {
            // Verify the authentication token
            decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            // Handle JWT verification errors
            if (error.name === 'JsonWebTokenError') {
                return {
                    status: 400,
                    error: true,
                    message: 'Invalid token.',
                    data: null,
                };
            }
            if (error.name === 'TokenExpiredError') {
                return {
                    status: 400,
                    error: true,
                    message: 'Token has expired.',
                    data: null,
                };
            }
            // Handle other JWT verification errors if needed
            return {
                status: 500,
                error: true,
                message: 'Internal Server Error',
                data: error.message || '',
            };
        }
        // Check if the user exists
        // @ts-ignore
        const user = yield Models_1.User.findOne({ email: decoded.email });
        if (!user) {
            return {
                status: 400,
                error: true,
                message: 'User not found. Token error',
                data: null,
            };
        }
        if (user.deleted) {
            return {
                status: 400,
                error: true,
                message: 'Account is deleted and not available for login.',
                data: null,
            };
        }
        if (user.blocked) {
            return {
                status: 400,
                error: true,
                message: 'Account is blocked and not available for login.',
                data: null,
            };
        }
        if (!user.verified) {
            return {
                status: 400,
                error: true,
                message: 'Account is not verified and not available for login.',
                data: null,
            };
        }
        // Continue with the code using the decoded token
        if (decoded.id !== user._id.toString()) {
            return {
                status: 400,
                error: true,
                message: 'Invalid token.',
                data: null,
            };
        }
        // Verify the user's device
        const device = yield Models_1.Device.findOne({
            user: user._id,
            token,
        });
        if (!device) {
            return {
                status: 400,
                error: true,
                message: 'Invalid device.',
                data: null,
            };
        }
        if (device.verified) {
            return {
                status: 400,
                error: true,
                message: 'Device is already verified',
                data: null,
            };
        }
        // @ts-ignore
        if (device.otp_verify_attempts >= 6 || device.otp_attempts >= 6) {
            return {
                status: 400,
                error: true,
                message: 'Maximum attempts reached',
                data: null,
            };
        }
        // @ts-ignore
        if (device.otp_expiry_time <= Date.now()) {
            return {
                status: 400,
                error: true,
                message: 'OTP expired',
                data: null,
            };
        }
        // Check if the provided OTP is incorrect
        // @ts-ignore
        if (!(yield device.correctOTP(otp, device.otp))) {
            // Increment OTP verification attempts if OTP is incorrect
            device.otp_verify_attempts = (device.otp_verify_attempts || 0) + 1;
            // @ts-ignore
            yield device.save({ new: true, validateModifiedOnly: true });
            return {
                status: 400,
                error: true,
                message: 'Incorrect OTP',
                data: null,
            };
        }
        // Mark the device as verified
        device.verified = true;
        device.otp = undefined;
        // @ts-ignore
        yield device.save({ new: true, validateModifiedOnly: true });
        const mailData = yield mail_1.default.sendDevice(user.firstName + ' ' + user.lastName, user.email, device);
        return {
            status: 200,
            error: false,
            message: 'Device verified successfully.',
            data: null,
        };
    }
    catch (error) {
        return {
            status: 500,
            error: true,
            message: 'Internal Server Error',
            data: error.message || '',
        };
    }
});
exports.verifyLogin = verifyLogin;
const deviceResendOTP = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, token } = data;
        // Find the user with the provided email
        const user = yield Models_1.User.findOne({ email });
        // Check if the user exists
        if (!user) {
            return {
                status: 400,
                error: true,
                message: 'Invalid email address',
                data: null,
            };
        }
        // Find the user's device with the provided token
        const device = yield Models_1.Device.findOne({ user: user._id, token });
        // Check if the device exists
        if (!device) {
            return {
                status: 400,
                error: true,
                message: 'Invalid device',
                data: null,
            };
        }
        // Check if the device is already verified
        if (device.verified) {
            return {
                status: 400,
                error: true,
                message: 'Device is already verified',
                data: null,
            };
        }
        // Check if the device has reached maximum OTP attempts
        // @ts-ignore
        if (device.otp_attempts >= 6) {
            // @ts-ignore
            if (Date.now() <= device.otp_request_date) {
                // Calculate and return time balance in hours and minutes format
                const timeBalance = calculateTimeBalance(device.otp_request_date);
                return {
                    status: 400,
                    error: true,
                    message: `Maximum OTP attempts reached for today, Try after ${timeBalance.hours} hr ${timeBalance.minutes} min`,
                    data: null,
                };
            }
        }
        // Send a new OTP to the user's device
        const mailData = yield mail_1.default.sendDeviceOTP(`${user.firstName} ${user.lastName}`, user.email, device);
        // Handle errors in sending OTP
        if (mailData.error) {
            return {
                status: 500,
                error: true,
                message: mailData.message,
                data: mailData.data,
            };
        }
        // Update device's OTP details and reset attempts
        device.otp = mailData.data;
        // @ts-ignore
        yield device.save({ new: true, validateModifiedOnly: true });
        // Return success message
        return {
            status: 200,
            error: false,
            message: 'New OTP sent to device successfully',
            data: { email },
        };
    }
    catch (error) {
        // Handle internal server error
        return {
            status: 500,
            error: true,
            message: 'Internal Server Error',
            data: { errorDetails: error.message || '' },
        };
    }
});
exports.deviceResendOTP = deviceResendOTP;
const logoutDevice = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = data;
        let decoded;
        try {
            // Verify the authentication token
            decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            // Handle JWT verification errors
            if (error.name === 'JsonWebTokenError') {
                return {
                    status: 400,
                    error: true,
                    message: 'Invalid token.',
                    data: null,
                };
            }
            if (error.name === 'TokenExpiredError') {
                return {
                    status: 400,
                    error: true,
                    message: 'Token has expired.',
                    data: null,
                };
            }
            // Handle other JWT verification errors if needed
            return {
                status: 500,
                error: true,
                message: 'Internal Server Error',
                data: error.message || '',
            };
        }
        // Check if the user exists
        // @ts-ignore
        const user = yield Models_1.User.findOne({ email: decoded.email });
        if (!user) {
            return {
                status: 400,
                error: true,
                message: 'User not found. Token error',
                data: null,
            };
        }
        if (user.deleted) {
            return {
                status: 400,
                error: true,
                message: 'Account is deleted',
                data: null,
            };
        }
        if (user.blocked) {
            return {
                status: 400,
                error: true,
                message: 'Account is blocked.',
                data: null,
            };
        }
        if (!user.verified) {
            return {
                status: 400,
                error: true,
                message: 'Account is not verified.',
                data: null,
            };
        }
        // Continue with the code using the decoded token
        // @ts-ignore
        if (decoded.id !== user._id.toString()) {
            return {
                status: 400,
                error: true,
                message: 'Invalid token.',
                data: null,
            };
        }
        // Find the device by the authentication token and perform logout logic
        const device = yield Models_1.Device.findOne({ user: user._id, token });
        // Check if the device exists
        if (!device) {
            return {
                status: 400,
                error: true,
                message: 'Invalid authentication token',
                data: null,
            };
        }
        // Implement your logout logic here (e.g., updating device status, revoking tokens)
        yield device.remove();
        return {
            status: 200,
            error: false,
            message: 'Device logged out successfully',
            data: null,
        };
    }
    catch (error) {
        // Handle internal server error
        return {
            status: 500,
            error: true,
            message: 'Internal Server Error',
            data: { errorDetails: error.message || '' },
        };
    }
});
exports.logoutDevice = logoutDevice;
const protectUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, email, id, deviceID } = data;
        // Check if the user exists
        const user = yield Models_1.User.findOne({ email });
        // @ts-ignore
        const protect_info = yield (0, protect_1.default)(user);
        if (protect_info.error)
            return protect_info;
        // Continue with the code using the decoded token
        // @ts-ignore
        if (id !== user._id.toString()) {
            return {
                status: 400,
                error: true,
                message: 'Invalid token.',
                data: null,
            };
        }
        // Verify the user's device
        const device = yield Models_1.Device.findOne({
            // @ts-ignore
            user: user._id,
            token,
        });
        if (!device) {
            return {
                status: 400,
                error: true,
                message: 'Invalid device.',
                data: null,
            };
        }
        if (!device.verified) {
            return {
                status: 400,
                error: true,
                message: 'Device not verified.',
                data: null,
            };
        }
        return {
            status: 200,
            error: false,
            message: 'Device verified successfully.',
            // @ts-ignore
            data: { user, device },
        };
    }
    catch (error) {
        return {
            status: 500,
            error: true,
            message: 'Internal Server Error',
            data: error.message || '',
        };
    }
});
exports.protectUser = protectUser;
const protectAdmin = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, email, id, deviceID } = data;
        // Check if the admin exists
        const admin = yield Models_1.Admin.findOne({ email });
        if (!admin) {
            return {
                status: 400,
                error: true,
                message: 'Admin not found. Token error',
                data: null,
            };
        }
        // @ts-ignore
        const protect_info = yield (0, protect_1.default)(admin);
        if (protect_info.error)
            return protect_info;
        // Continue with the code using the decoded token
        if (id !== admin._id.toString()) {
            return {
                status: 400,
                error: true,
                message: 'Invalid token.',
                data: null,
            };
        }
        // Verify the admin's device
        const device = yield Models_1.Device.findOne({
            user: admin._id,
            token,
        });
        if (!device) {
            return {
                status: 400,
                error: true,
                message: 'Invalid device.',
                data: null,
            };
        }
        if (!device.verified) {
            return {
                status: 400,
                error: true,
                message: 'Device not verified.',
                data: null,
            };
        }
        return {
            status: 200,
            error: false,
            message: 'Device verified successfully.',
            data: { admin, device },
        };
    }
    catch (error) {
        return {
            status: 500,
            error: true,
            message: 'Internal Server Error',
            data: error.message || '',
        };
    }
});
exports.protectAdmin = protectAdmin;
const forgotPassword = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: forgotPassword function
    // ...
});
exports.forgotPassword = forgotPassword;
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

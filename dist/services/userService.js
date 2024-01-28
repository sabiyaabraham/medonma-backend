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
exports.removeProfile = exports.updatePic = exports.updateInfo = exports.userInfo = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Models_1 = require("../Models");
const protect_1 = __importDefault(require("../utils/protect"));
const filterObj_1 = __importDefault(require("../lib/filterObj"));
/**
 * Generates a unique filename based on timestamp and a random string.
 * @returns {string} Unique filename.
 */
const generateUniqueFileName = () => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomString}`;
};
/**
 * Retrieves user information.
 * @param {object} data - Unused parameter.
 * @param {Request} req - Express request object.
 * @returns {object} Object containing user information or an error response.
 */
const userInfo = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const email = req.user.email;
        // Find the user with the provided email
        const user = yield Models_1.User.findOne({ email });
        // @ts-ignore
        const protectInfo = yield (0, protect_1.default)(user);
        if (protectInfo.error)
            return protectInfo;
        // @ts-ignore
        yield user.save({ new: true, validateModifiedOnly: true });
        return {
            status: 200,
            error: false,
            message: 'User information.',
            data: user,
        };
    }
    catch (error) {
        return {
            status: 500,
            error: true,
            message: `Internal Server Error`,
            data: { errorDetails: error.message || '' },
        };
    }
});
exports.userInfo = userInfo;
/**
 * Updates user information.
 * @param {object} data - Object containing user information to be updated.
 * @param {Request} req - Express request object.
 * @returns {object} Object containing updated user information or an error response.
 */
const updateInfo = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const email = req.user.email;
        // Find the user with the provided email
        const user = yield Models_1.User.findOne({ email });
        // @ts-ignore
        const protectInfo = yield (0, protect_1.default)(user);
        if (protectInfo.error)
            return protectInfo;
        // Filter out unnecessary fields
        const filteredBody = (0, filterObj_1.default)(data, 'firstName', 'lastName', 'about', 'dob', 'age', 'address');
        // @ts-ignore
        user.set(Object.assign({}, filteredBody));
        // @ts-ignore
        yield user.save({ new: true, validateModifiedOnly: true });
        return {
            status: 200,
            error: false,
            message: 'User information updated.',
            data: Object.assign({}, user),
        };
    }
    catch (error) {
        return {
            status: 500,
            error: true,
            message: `Internal Server Error`,
            data: { errorDetails: error.message || '' },
        };
    }
});
exports.updateInfo = updateInfo;
/**
 * Updates user profile picture.
 * @param {object} data - Unused parameter.
 * @param {Request} req - Express request object.
 * @returns {object} Object containing updated profile picture information or an error response.
 */
const updatePic = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const email = req.user.email || req.user;
        const avatarFile = req.file;
        // Find the user with the provided email
        const user = yield Models_1.User.findOne({ email });
        // @ts-ignore
        const protectInfo = yield (0, protect_1.default)(user);
        if (protectInfo.error)
            return protectInfo;
        if (avatarFile) {
            // Generate a unique file name with a file extension
            const fileExtension = avatarFile.originalname.split('.').pop();
            const uniqueFileName = generateUniqueFileName() + `.${fileExtension}`;
            // Save the file to the specified path
            const filePath = `tmp/profile/${uniqueFileName}`;
            const directoryPath = path_1.default.dirname(filePath);
            if (!fs_1.default.existsSync(directoryPath)) {
                fs_1.default.mkdirSync(directoryPath, { recursive: true });
            }
            // Now you can safely write the file
            yield fs_1.default.promises.writeFile(filePath, avatarFile.buffer);
            // Save the image and get the new avatar name
            //   const newAvatarName = await saveImage(user, filePath, uniqueFileName, avatarFile.buffer);
            // Update user avatar with the new file name
            // @ts-ignore
            user.avatar = uniqueFileName;
            // Read the image file as a buffer
            const imageBuffer = fs_1.default.readFileSync(filePath);
            // Convert the buffer to base64
            const base64Image = imageBuffer.toString('base64');
            // @ts-ignore
            yield user.save({ new: true, validateModifiedOnly: true });
            return {
                status: 200,
                error: false,
                message: 'Profile updated!',
                data: {
                    avatar: `data:image/${fileExtension};base64,${base64Image}`,
                    extension: fileExtension,
                },
            };
        }
        return {
            status: 200,
            error: false,
            message: 'No profile given',
            data: null,
        };
    }
    catch (error) {
        console.error(error);
        return {
            status: 500,
            error: true,
            message: `Internal Server Error`,
            data: { errorDetails: error.message || '' },
        };
    }
});
exports.updatePic = updatePic;
/**
 * Removes user profile picture.
 * @param {object} data - Unused parameter.
 * @param {Request} req - Express request object.
 * @returns {object} Object containing updated profile picture information or an error response.
 */
const removeProfile = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const { email } = req.user;
        // Find the user with the provided email
        const user = yield Models_1.User.findOne({ email });
        // @ts-ignore
        const protectInfo = yield (0, protect_1.default)(user);
        if (protectInfo.error)
            return protectInfo;
        const avatar = 'aa.jpeg';
        // @ts-ignore
        user.avatar = avatar;
        // @ts-ignore
        yield user.save({ new: true, validateModifiedOnly: true });
        return {
            status: 200,
            error: false,
            message: 'Profile updated!',
            data: { avatar: avatar },
        };
    }
    catch (error) {
        return {
            status: 500,
            error: true,
            message: `Internal Server Error`,
            data: { errorDetails: error.message || '' },
        };
    }
});
exports.removeProfile = removeProfile;

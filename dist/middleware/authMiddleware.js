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
exports.protectAdmin = exports.protectUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const authService_1 = require("../services/authService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET
    ? process.env.JWT_SECRET
    : 'medonma';
// Authentication middleware for users
exports.protectUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            let decoded;
            try {
                // Verify the authentication token
                decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            }
            catch (error) {
                // Handle JWT verification errors
                if (error.name === 'JsonWebTokenError') {
                    return res.status(400).json({
                        status: 400,
                        error: true,
                        message: 'Invalid token.',
                        data: null,
                    });
                }
                if (error.name === 'TokenExpiredError') {
                    return res.status(400).json({
                        status: 400,
                        error: true,
                        message: 'Token has expired.',
                        data: null,
                    });
                }
                // Handle other JWT verification errors if needed
                return res.status(500).json({
                    status: 500,
                    error: true,
                    message: 'Internal Server Error',
                    data: error.message || '',
                });
            }
            const { id, email } = decoded;
            const response = yield (0, authService_1.protectUser)({
                id,
                email,
                token,
            });
            if (response.error) {
                return res.status(response.status).json(response);
            }
            else {
                // @ts-ignore
                req.user = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.user;
                next();
            }
        }
        catch (error) {
            return res.status(401).json({
                status: 401,
                error: true,
                message: 'Not authorized, token failed',
                data: null,
            });
        }
    }
    else {
        return res.status(401).json({
            status: 401,
            error: true,
            message: 'Not authorized, no token',
            data: null,
        });
    }
}));
// Authentication middleware for admins
exports.protectAdmin = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            let decoded;
            try {
                // Verify the authentication token
                decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            }
            catch (error) {
                // Handle JWT verification errors
                if (error.name === 'JsonWebTokenError') {
                    return res.status(400).json({
                        status: 400,
                        error: true,
                        message: 'Invalid token.',
                        data: null,
                    });
                }
                if (error.name === 'TokenExpiredError') {
                    return res.status(400).json({
                        status: 400,
                        error: true,
                        message: 'Token has expired.',
                        data: null,
                    });
                }
                // Handle other JWT verification errors if needed
                return res.status(500).json({
                    status: 500,
                    error: true,
                    message: 'Internal Server Error',
                    data: error.message || '',
                });
            }
            const { id, email } = decoded;
            const response = yield (0, authService_1.protectAdmin)({
                id,
                email,
                token,
            });
            if (response.error) {
                return res.status(response.status).json(response);
            }
            else {
                req.body['Auth'] = response.data;
                next();
            }
        }
        catch (error) {
            return res.status(401).json({
                status: 401,
                error: true,
                message: 'Not authorized, token failed',
                data: null,
            });
        }
    }
    else {
        return res.status(401).json({
            status: 401,
            error: true,
            message: 'Not authorized, no token',
            data: null,
        });
    }
}));

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
Object.defineProperty(exports, "__esModule", { value: true });
const checkUserStatus = (user) => __awaiter(void 0, void 0, void 0, function* () {
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
            message: 'Account is deleted.',
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
    return {
        error: false,
        status: 200,
        message: 'account verified',
        data: null,
    };
});
exports.default = checkUserStatus;

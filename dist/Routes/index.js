"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRoute_1 = __importDefault(require("./userRoute"));
const authRoute_1 = __importDefault(require("./authRoute"));
const router = (0, express_1.Router)();
router.use('/api/v1/user', userRoute_1.default);
router.use('/api/v1/auth', authRoute_1.default);
router.get('/test', (req, res) => {
    res.send('Hello World');
});
exports.default = router;

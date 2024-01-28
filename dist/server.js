"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @description      :
 * @author           :
 * @group            :
 * @created          : 28/01/2024 - 07:58:20
 *
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 28/01/2024
 * - Author          :
 * - Modification    :
 **/
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("./Routes/index"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cookie_session_1 = __importDefault(require("cookie-session"));
require("colors");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '10kb' }));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cookie_session_1.default)({
    secret: 'MEDONMA',
}));
app.use(index_1.default);
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.get('/', (req, res) => {
    return res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
exports.default = app;

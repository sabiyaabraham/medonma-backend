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
/**
 * @description      : Index
 * @author           : Sabiya Abraham
 * @group            : Team MEDONMA
 * @created          : 27/01/2024 - 14:29:41
 *
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 27/01/2024
 * - Author          : Sabiya Abraham
 * - Modification    :
 **/
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
require("colors");
const server_1 = __importDefault(require("./server"));
const envPath = path_1.default.join(__dirname, '..', 'config.env');
dotenv_1.default.config({ path: envPath });
require('./lib/account');
require('@ajayos/nodelog');
const server = http_1.default.createServer(server_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'PATCH', 'POST', 'DELETE', 'PUT'],
    },
});
const port = Number(process.env.PORT) || 3001;
server.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`App running on port = ${port} ...`.bgBlue.white);
    try {
        // Fetch public IP using an external service
        const { data: { ip }, } = yield axios_1.default.get('https://api64.ipify.org?format=json');
        console.log(`Public IP Address: ${ip}`);
    }
    catch (err) {
        console.error('Error fetching public IP:', err.message);
    }
}));
process.on('uncaughtException', (err) => {
    console.log(err);
    console.log('UNCAUGHT Exception! Shutting down ...');
    // run npm start
    process.exit(1); // Exit Code 1 indicates that a container shut down, either because of an application failure.
});
process.on('unhandledRejection', (err) => {
    console.log(err);
    console.log('UNHANDLED REJECTION! Shutting down ...');
    server.close(() => {
        process.exit(1); // Exit Code 1 indicates that a container shut down, either because of an application failure.
    });
});

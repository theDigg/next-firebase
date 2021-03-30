"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const next_1 = __importDefault(require("next"));
const socketio = __importStar(require("socket.io"));
const cors_1 = __importDefault(require("cors"));
const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const nextApp = next_1.default({ dev });
const nextHandler = nextApp.getRequestHandler();
nextApp.prepare().then(async () => {
    const app = express_1.default();
    app.use(cors_1.default());
    const server = http.createServer(app);
    const io = new socketio.Server();
    io.attach(server);
    app.get("/hello", async (_, res) => {
        res.send("Hello World");
    });
    io.on("connection", (socket) => {
        console.log("connection");
        socket.emit("status", "Hello from Socket.io");
        socket.on('message', (msg) => {
            console.log(msg);
        });
        socket.on("disconnect", () => {
            console.log("client disconnected");
        });
    });
    app.all("*", (req, res) => nextHandler(req, res));
    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
});

import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { initSocket } from "./config/socket.js";
import { registerEditorHandlers } from "./sockets/editorHandler.js";
import { registerChatHandlers } from "./sockets/chatHandler.js";
import { fixCode } from "./controllers/aiController.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const __dirname = path.resolve();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.post("/ai/fix-code", fixCode);

const io = initSocket(server);

io.on("connection", (socket) => {
    console.log(`📡 New Connection: ${socket.id}`);

    // Context for Editor state
    const context = {
        currentCodeRoom: null,
        currentCodeUser: null
    };

    // Register Handlers (Ab ye khud disconnect handle karenge)
    registerEditorHandlers(io, socket, context);
    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
        console.log(`🔌 Socket Closed: ${socket.id}`);
    });
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
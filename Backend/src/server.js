import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { initSocket } from "./config/socket.js";
import { registerEditorHandlers } from "./sockets/editorHandler.js";
import { registerChatHandlers } from "./sockets/chatHandler.js";
import { fixCode } from "./controllers/aiController.js";
import { shareRoom } from "./controllers/shareRoomViaEmail.js";
dotenv.config();
const app = express();
const server = http.createServer(app);

// 1. Remove path.resolve() and static serving if not hosting frontend here
app.use(cors({
    origin: "*", // Change this to your Frontend URL once deployed (e.g., https://your-app.vercel.app)
    methods: ["GET", "POST"],
    
}));

app.use(express.json());

// ⚠️ DELETE OR COMMENT OUT THESE TWO LINES:
// app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.post("/ai/fix-code", fixCode);
console.log("Registering /api/shareRoom route...");
app.post("/api/shareRoom", shareRoom); 
const io = initSocket(server);

io.on("connection", (socket) => {
    console.log(`📡 New Connection: ${socket.id}`);

    const context = {
        currentCodeRoom: null,
        currentCodeUser: null
    };

    registerEditorHandlers(io, socket, context);
    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
        console.log(`🔌 Socket Closed: ${socket.id}`);
    });
});

// ⚠️ DELETE OR COMMENT OUT THIS BLOCK:
/*
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});
*/

// Add a simple health check route
app.get("/", (req, res) => {
    res.send("CodeSync Backend is running...");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
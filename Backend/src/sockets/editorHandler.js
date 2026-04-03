import { executeCode } from "../services/codeExecution.js";

const rooms = new Map();
const socketToUser = new Map();
export const registerEditorHandlers = (io, socket, context) => {
    // socket.on("join", ({ roomId, userName }) => {
    //     // Save these to the context so we can use them in other events
    //     context.currentCodeRoom = roomId;
    //     context.currentCodeUser = userName;
        
    //     socket.join(roomId);

    //     if (!rooms.has(roomId)) {
    //         rooms.set(roomId, { 
    //             users: new Set(), 
    //             code: "// start code here", 
    //             language: "javascript" 
    //         });
    //     }
    //     rooms.get(roomId).users.add(userName);

    //     socket.emit("codeUpdate", rooms.get(roomId).code);
    //     socket.emit("languageUpdate", rooms.get(roomId).language);
    //     io.to(roomId).emit("userJoined", Array.from(rooms.get(roomId).users));
    // });
    // Backend ke join event mein ye logic daalo
    socket.on("join", ({ roomId, userName }) => {
        if (!roomId || !userName) return;
        const cleanId = roomId.trim().toLowerCase();

        socket.join(cleanId);

        // Store session info for this specific connection
        socketToUser.set(socket.id, { roomId: cleanId, userName });

        if (!rooms.has(cleanId)) {
            rooms.set(cleanId, {
                users: new Set(),
                code: "// start code here",
                language: "javascript"
            });
        }

        const room = rooms.get(cleanId);
        room.users.add(userName);

        socket.emit("codeUpdate", room.code);
        socket.emit("languageUpdate", room.language);

        // Broadcast updated list to everyone in the room
        io.to(cleanId).emit("userJoined", Array.from(room.users));
    });

    // Add this explicit disconnect listener
    socket.on("disconnect", () => {
        const userData = socketToUser.get(socket.id);

        if (userData) {
            const { roomId, userName } = userData;
            const room = rooms.get(roomId);

            if (room) {
                room.users.delete(userName);

                // If room is empty, you might want to delete it, 
                // otherwise just update the count for others
                if (room.users.size === 0) {
                    rooms.delete(roomId);
                } else {
                    io.to(roomId).emit("userJoined", Array.from(room.users));
                }
            }
            // Clean up our tracking map
            socketToUser.delete(socket.id);
            console.log(`${userName} left room: ${roomId}`);
        }
    });
    socket.on("codeChange", ({ roomId, code }) => {
        if (rooms.has(roomId)) {
            rooms.set(roomId, { ...rooms.get(roomId), code });
            socket.to(roomId).emit("codeUpdate", code);
        }
    });

    // FIXED THIS BLOCK
    socket.on("runCode", ({ roomId, code, language }) => {
        // Get the user data we stored during "join"
        const userData = socketToUser.get(socket.id);
        const runner = userData ? userData.userName : "Anonymous";

        io.to(roomId).emit("codeRunning", { user: runner });

        executeCode(code, language, (result) => {
            console.log("Code execution finished:", result); 

            io.to(roomId).emit("codeResult", {
                user: runner,
                output: result.output || '',
                error: result.error || '',
                timestamp: new Date().toLocaleTimeString()
            });
        });
    });

    return () => {
        if (context.currentCodeRoom && rooms.has(context.currentCodeRoom)) {
            rooms.get(context.currentCodeRoom).users.delete(context.currentCodeUser);
            io.to(context.currentCodeRoom).emit("userJoined", Array.from(rooms.get(context.currentCodeRoom).users));
        }
    };
};
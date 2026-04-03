const chatUsers = new Map();

export const registerChatHandlers = (io, socket) => {

    const handleLeave = () => {
        const user = chatUsers.get(socket.id);
        if (user) {
            const { roomId, peerId, username } = user;
            chatUsers.delete(socket.id);

            // Notify others
            io.to(roomId).emit("user-disconnected", peerId);
            io.to(roomId).emit("users", getUsersInRoom(roomId));

            io.to(roomId).emit("message", {
                sender: "System",
                text: `${username} left the chat`,
                time: new Date(),
            });
        }
    };

    socket.on("joinChat", ({ username, roomId, peerId }) => {
        const cleanId = roomId.trim().toLowerCase();
        if (chatUsers.has(socket.id)) return;
        chatUsers.set(socket.id, { username, roomId: cleanId, peerId, isSpeaking: false });
        socket.join(cleanId);

        io.to(cleanId).emit("users", getUsersInRoom(cleanId));
        io.to(cleanId).emit("message", {
            sender: "System",
            text: `${username} joined the chat`,
            time: new Date(),
        });
    });

    socket.on("message", (msgData) => {
        const user = chatUsers.get(socket.id);
        if (user) {
            io.to(user.roomId).emit("message", {
                sender: user.username,
                text: msgData.text,
                time: new Date(),
            });
        }
    });

    socket.on("disconnect", handleLeave);
};

function getUsersInRoom(roomId) {
    const roomUsers = [];
    for (let [id, user] of chatUsers) {
        if (user.roomId === roomId) {
            roomUsers.push({
                username: user.username,
                peerId: user.peerId,
                isSpeaking: user.isSpeaking
            });
        }
    }
    return roomUsers;
}
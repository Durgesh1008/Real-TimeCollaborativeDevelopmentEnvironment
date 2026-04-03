import { useEffect, useState } from "react";
import io from "socket.io-client";
import { SOCKET_URL, DEFAULT_CODE } from "../utils/constants";

// Initialize socket outside to prevent multiple connections on re-render
const socket = io(SOCKET_URL);

export const useSocket = (userName, roomId) => {
    const [users, setUsers] = useState([]);
    const [code, setCode] = useState(DEFAULT_CODE.javascript);
    const [language, setLanguage] = useState("javascript");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [typing, setTyping] = useState("");
    const [lastError, setLastError] = useState("");

    useEffect(() => {
        if (!socket) return;

        // Listen for users joining/leaving
        socket.on("userJoined", (userList) => {
            setUsers(userList);
        });

        // Sync code changes from other users
        socket.on("codeUpdate", (newCode) => {
            setCode(newCode);
        });

        // Sync language changes
        socket.on("languageUpdate", (newLang) => {
            setLanguage(newLang);
        });

        // Handle typing indicators
        socket.on("userTyping", (user) => {
            if (user === userName) return;
            setTyping(`${user.slice(0, 8)}... is typing`);

            const timeout = setTimeout(() => setTyping(""), 2000);
            return () => clearTimeout(timeout);
        });

        // Handle execution start
        socket.on("codeRunning", ({ user }) => {
            setIsRunning(true);
            setOutput(`🚀 ${user} is running the code...`);
        });

        // Handle execution results
        socket.on("codeResult", ({ user, output, error, timestamp }) => { 
            setIsRunning(false);
            setLastError(error || "");
            console.log(user)
            // 2. Add the user's name to the header of the result
            let result = `[${timestamp}] - Run by: ${user || "Unknown"}\n`;
            console.log(result)
            if (error) {
                result += `❌ ERROR:\n${error}`;
            } else {
                result += `✅ OUTPUT:\n${output || "Program executed successfully (no output)."}`;
            }

            setOutput(result);
        });

        // Cleanup listeners on unmount
        return () => {
            socket.off("userJoined");
            socket.off("codeUpdate");
            socket.off("languageUpdate");
            socket.off("userTyping");
            socket.off("codeRunning");
            socket.off("codeResult");
        };
    }, [userName, roomId]);

    

    const emitCodeChange = (newCode) => {
        socket.emit("codeChange", { roomId, code: newCode });
        socket.emit("typing", { roomId, userName });
    };

    const emitLanguageChange = (newLang, shouldResetCode = true) => {
        setLanguage(newLang);

        // Only reset to default code if we aren't uploading a file
        if (shouldResetCode) {
            const newDefaultCode = DEFAULT_CODE[newLang] || "";
            setCode(newDefaultCode);
            socket.emit("codeChange", { roomId, code: newDefaultCode });
        }

        socket.emit("languageChange", { roomId, language: newLang });
    };

    const runRemoteCode = () => {
        if (!code.trim()) return setOutput("❌ Error: Code is empty!");
        socket.emit("runCode", { roomId, code, language });
    };

    
    const clearOutput = () => {
        setOutput("");
        setLastError("");
    };

    return {
        socket,
        users,
        code,
        setCode,
        language,
        output,
        isRunning,
        typing,
        lastError,
        emitCodeChange,
        emitLanguageChange,
        runRemoteCode,
        clearOutput // Exporting the fix here
    };
};
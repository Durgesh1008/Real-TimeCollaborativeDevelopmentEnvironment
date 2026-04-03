import React, { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import "./ChatBot.css";

const ChatBox = ({ socket, username, roomId }) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [inVoice, setInVoice] = useState(false);

    const messagesEndRef = useRef(null);
    const myPeer = useRef(null);
    const myStream = useRef(null);
    const peers = useRef({});
    const hasJoined = useRef(false);

    // --- Call Icons ---
    const CallIcon = () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
    );

    const EndCallIcon = () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
    );

    const formatTime = (time) => {
        try {
            return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch { return ""; }
    };

    useEffect(() => {
        if (!socket || hasJoined.current) return;

        // Initialize PeerJS
        myPeer.current = new Peer(undefined, { debug: 1 });

        myPeer.current.on("open", (id) => {
            console.log("My Peer ID:", id);
            socket.emit("joinChat", { username, roomId, peerId: id });
            hasJoined.current = true;
        });

        // Handle incoming calls
        myPeer.current.on("call", (call) => {
            call.answer(myStream.current);
            const audio = document.createElement("audio");
            call.on("stream", (remoteStream) => {
                audio.srcObject = remoteStream;
                document.body.appendChild(audio);
                audio.play().catch(e => console.error("Audio Play Error:", e));
            });
        });

        // --- Socket Listeners ---

        // Receiving Messages (System & User)
        socket.on("message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        // Sync User List & Count
        socket.on("users", (roomUsers) => {
            setParticipants(roomUsers);
        });

        // Handle new voice connections
        socket.on("user-connected", (userId) => {
            if (myStream.current) {
                const call = myPeer.current.call(userId, myStream.current);
                const audio = document.createElement("audio");
                call.on("stream", (remoteStream) => {
                    audio.srcObject = remoteStream;
                    document.body.appendChild(audio);
                    audio.play().catch(e => console.error(e));
                });
                peers.current[userId] = call;
            }
        });

        // Handle user leaving voice
        socket.on("user-disconnected", (peerId) => {
            if (peers.current[peerId]) {
                peers.current[peerId].close();
                delete peers.current[peerId];
            }
        });

        return () => {
            // Clean up listeners on unmount
            socket.off("message");
            socket.off("users");
            socket.off("user-connected");
            socket.off("user-disconnected");

            if (myPeer.current) myPeer.current.destroy();
            hasJoined.current = false;
        };
    }, [socket, username, roomId]);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const toggleVoice = async () => {
        if (!inVoice) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                myStream.current = stream;
                setInVoice(true);
                // Inform others we are ready to talk
                socket.emit("ready-to-speak", { roomId, peerId: myPeer.current.id });
                setupVolumeDetection(stream);
            } catch (err) {
                alert("Mic access denied or not found.");
            }
        } else {
            // Stop mic tracks
            if (myStream.current) {
                myStream.current.getTracks().forEach(track => track.stop());
            }
            myStream.current = null;
            setInVoice(false);
            socket.emit("speaking-state", { roomId, isSpeaking: false });
        }
    };

    const setupVolumeDetection = (stream) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
            if (!myStream.current) return;
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            // Emit speaking state based on volume threshold
            socket.emit("speaking-state", { roomId, isSpeaking: average > 15 });
            requestAnimationFrame(checkVolume);
        };
        checkVolume();
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        socket.emit("message", { text: message.trim(), roomId });
        setMessage("");
    };

    return (
        <div className="chat-wrapper">
            <div className="chat-header">
                <div className="chat-title">
                    <div className="status-indicator"></div>
                    <h3>LIVE CHAT</h3>
                </div>
                <button
                    className={`voice-control-btn ${inVoice ? 'active' : ''}`}
                    onClick={toggleVoice}
                    title={inVoice ? "End Call" : "Start Call"}
                >
                    {inVoice ? <EndCallIcon /> : <CallIcon />}
                </button>
            </div>

            <div className="voice-bar">
                {participants.map((p, idx) => (
                    <div
                        key={p.peerId || idx}
                        className={`participant-avatar ${p.isSpeaking ? "is-speaking" : ""}`}
                        title={p.username}
                    >
                        {/* {p.username?.[0]?.toUpperCase()} */}
                        <div className="tooltip-name">{p.username?.[0].toUpperCase()}</div>
                    </div>
                ))}
            </div>

            <div className="chat-body">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`message-row ${m.sender === username ? "me" :
                                m.sender === "System" ? "system-row" : "other"
                            }`}
                    >
                        {m.sender !== "System" && (
                            <div className="message-meta">
                                <span className="sender-name">{m.sender}</span>
                                <span className="message-time">{formatTime(m.time)}</span>
                            </div>
                        )}
                        <div className="bubble">
                            {m.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-footer" onSubmit={handleSend}>
                <input
                    type="text"
                    placeholder="Message session..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit">SEND</button>
            </form>
        </div>
    );
};

export default ChatBox;
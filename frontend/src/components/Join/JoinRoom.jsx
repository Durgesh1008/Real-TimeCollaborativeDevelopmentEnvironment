import React, { useState } from 'react';
import { v4 as uuidv4 } from "uuid";
import "./JoinRoom.css";
import Footer from '../Footer/Footer';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const JoinRoom = ({ roomId, setRoomId, userName, setUserName, onJoin }) => {
    const [isEditable, setIsEditable] = useState(false);
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

    const handleGenerateId = (e) => {
        e.preventDefault();
        setRoomId(uuidv4());
        setIsEditable(false);
    };

    const toggleManualEntry = (e) => {
        e.preventDefault();
        setIsEditable(!isEditable);
    };

    const handleShareEmail = async () => {
        // If the input isn't shown yet, just show it
        if (!showEmailInput) {
            setShowEmailInput(true);
            return;
        }

        // Validation
        if (!inviteEmail || !inviteEmail.includes("@")) {
            setStatusMsg({ type: "error", text: "Please enter a valid email." });
            return;
        }

        setIsSending(true);
        setStatusMsg({ type: "", text: "" });

        const cleanBaseUrl = API_BASE_URL?.replace(/\/+$/, "");
        const targetUrl = `${cleanBaseUrl}/api/shareRoom`;

        try {
            const response = await fetch(targetUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: inviteEmail,
                    roomId,
                    senderName: userName || "A collaborator"
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatusMsg({ type: "success", text: "🚀 Invitation Sent!" });
                setInviteEmail("");
                setTimeout(() => setShowEmailInput(false), 2000); // Hide after success
            } else {
                throw new Error(data.message || "Failed to send");
            }
        } catch (error) {
            setStatusMsg({ type: "error", text: error.message });
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && roomId && userName) onJoin();
    };

    return (
        <div className="main-wrapper">
            <div className="bg-blur-circle-1"></div>
            <div className="bg-blur-circle-2"></div>

            <header className="top-header">
                <h1>RealTime<span className="editor-text">CodeEditor</span></h1>
            </header>

            <div className="content-body">
                <div className="join-card">
                    <h2 className="card-title">Join Code Room</h2>

                    <div className="input-group">
                        <label>Workspace Identifier</label>
                        <div className="row-group">
                            <input
                                type="text"
                                placeholder="Generate or paste ID"
                                className={`input-box ${isEditable ? 'editable' : 'locked'}`}
                                value={roomId}
                                readOnly={!isEditable}
                                onChange={(e) => setRoomId(e.target.value)}
                            />
                            <button onClick={handleGenerateId} className="btn-generate">New ID</button>
                        </div>
                        <button className="btn-toggle-manual" onClick={toggleManualEntry}>
                            {isEditable ? "🔒 Lock ID" : "✏️ Enter Manually"}
                        </button>
                    </div>

                    <div className="input-group">
                        <label>Display Name</label>
                        <input
                            type="text"
                            placeholder="Your Name"
                            className="input-box full-width"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    <div className="button-stack">
                        <button onClick={onJoin} className="btn-join" disabled={!roomId || !userName}>
                            Initialize Connection
                        </button>

                        <div className={`invite-container ${showEmailInput ? 'active' : ''}`}>
                            {showEmailInput && (
                                <input
                                    type="email"
                                    placeholder="Enter collaborator's email"
                                    className="input-box invite-input"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    autoFocus
                                />
                            )}

                            <button
                                onClick={handleShareEmail}
                                className={`btn-invite ${isSending ? 'loading' : ''}`}
                                disabled={!roomId || isSending}
                            >
                                {isSending ? "Sending..." : showEmailInput ? "Send Invitation" : "Share via Email"}
                            </button>

                            {showEmailInput && !isSending && (
                                <button className="btn-cancel-text" onClick={() => setShowEmailInput(false)}>
                                    Cancel
                                </button>
                            )}
                        </div>

                        {statusMsg.text && (
                            <p className={`status-text ${statusMsg.type}`}>{statusMsg.text}</p>
                        )}
                    </div>
                </div>
            </div>
            {/* <Footer /> */}
        </div>
    );
};

export default JoinRoom;
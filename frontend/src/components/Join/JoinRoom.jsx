import React, { useState } from 'react';
import { v4 as uuidv4 } from "uuid";

import "./JoinRoom.css";
// const API_BASE_URL = "http://localhost:5000";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const JoinRoom = ({ roomId, setRoomId, userName, setUserName, onJoin }) => {
    const [isEditable, setIsEditable] = useState(false);
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    // Generate a fresh UUID and lock the field
    const handleGenerateId = (e) => {
        e.preventDefault();
        setRoomId(uuidv4());
        setIsEditable(false);
    };

    // Toggle the ability to paste/type an ID
    const toggleManualEntry = (e) => {
        e.preventDefault();
        setIsEditable(!isEditable);
    };

    const handleShareEmail = async () => {
        // 1. Validation: Ensure we have a Room ID
        if (!roomId) return alert("Please generate or enter a Room ID first!");

        // 2. Get recipient email via prompt
        const email = prompt("Enter the recipient's email address:");
        if (!email) return; // User cancelled prompt

        // 3. Basic Email Validation
        if (!email.includes("@")) return alert("Please enter a valid email address.");

        // 4. URL Cleanup: Prevent double slashes (e.g., https://site.com//api)
        const cleanBaseUrl = API_BASE_URL.endsWith('/')
            ? API_BASE_URL.slice(0, -1)
            : API_BASE_URL;

        const targetUrl = `${cleanBaseUrl}/api/shareRoom`;
        console.log("🚀 Sending invite to:", targetUrl);

        try {
            // 5. Make the API request
            const response = await fetch(targetUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    roomId,
                    senderName: userName || "A collaborator"
                }),
            });

            // 6. Handle Server Errors (404, 500, etc.)
            if (!response.ok) {
                const errorText = await response.text();
                // If the server sends back HTML (the 404 page), we handle it gracefully
                if (errorText.includes("<!DOCTYPE html>")) {
                    throw new Error(`Route not found (404). Check if backend is deployed with /api/shareRoom`);
                }
                throw new Error(errorText || `Server Error: ${response.status}`);
            }

            // 7. Parse Response
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                alert("✅ Invitation sent successfully!");
            } else {
                // Handle cases where the email sends but server doesn't return JSON
                alert("📧 Invite sent! (Note: Server response was not JSON)");
            }

        } catch (error) {
            console.error("❌ Email error details:", error);
            alert(`Failed to send invite: ${error.message}`);
        }
    };
    // Allow joining by pressing Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && roomId && userName) {
            onJoin();
        }
    };

    return (
        <div className="main-wrapper">
            {/* Background Decorative Gradient Orbs */}
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
                                onKeyDown={handleKeyDown}
                            />
                            <button onClick={handleGenerateId} className="btn-generate">
                                New ID
                            </button>
                        </div>
                        <button className="btn-toggle-manual" onClick={toggleManualEntry}>
                            {isEditable ? "🔒 Lock Identifier" : "✏️ Enter Manually"}
                        </button>
                    </div>

                    <div className="input-group">
                        <label>Display Name</label>
                        <input
                            type="text"
                            placeholder="Alex Smith"
                            className="input-box full-width"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    <div className="button-stack">
                        {/* New Inline Email Input */}
                        {showEmailInput && (
                            <div className="input-group invite-fade-in">
                                <input
                                    type="email"
                                    placeholder="friend@example.com"
                                    className="input-box full-width invite-input"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )}

                        <button
                            onClick={onJoin}
                            className="btn-join"
                            disabled={!roomId || !userName}
                        >
                            Initialize Connection
                        </button>

                        <button
                            onClick={handleShareEmail}
                            className="btn-invite"
                            disabled={!roomId}
                        >
                            {showEmailInput ? "📧 Send Invite Now" : "Share workspace link"}
                        </button>

                        {showEmailInput && (
                            <button className="btn-cancel" onClick={() => setShowEmailInput(false)}>
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinRoom;
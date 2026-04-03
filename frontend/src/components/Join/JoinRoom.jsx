import React, { useState } from 'react';
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';
import "./JoinRoom.css";

const JoinRoom = ({ roomId, setRoomId, userName, setUserName, onJoin }) => {
    const [isEditable, setIsEditable] = useState(false);

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
        if (!roomId) return alert("Please generate or enter a Room ID first!");

        const email = prompt("Enter the recipient's email address:");
        if (!email) return;

        // Basic email validation
        if (!email.includes("@")) return alert("Please enter a valid email address.");

        try {
            await axios.post('http://localhost:5000/api/share-room', {
                email,
                roomId,
                senderName: userName || "A collaborator"
            });
            alert("Invitation sent successfully!");
        } catch (error) {
            console.error("Email error:", error);
            alert("Backend error: Could not send email. Make sure your server is running.");
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
                            Share workspace link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinRoom;
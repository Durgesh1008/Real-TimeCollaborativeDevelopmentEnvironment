import { useState, useRef } from "react";
import { useSocket } from "./hooks/useSocket";
import { SOCKET_URL } from "./utils/constants";
import JoinRoom from "./components/Join/JoinRoom";
import CodeEditor from "./components/Editor/CodeEditor";
import ChatBox from "./components/Chat/ChatBox";
import AIPanel from "./components/AI/AIPanel";
import "./App.css";
import Footer from "./components/Footer/Footer";

const App = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [copied, setCopied] = useState(false);
  const [isOutputZoomed, setIsOutputZoomed] = useState(false);

  // Ref for hidden file input
  const fileInputRef = useRef(null);

  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiFixedCode, setAiFixedCode] = useState("");

  const {
    socket, users, code, setCode, language,
    output, isRunning, typing, lastError,
    emitCodeChange, emitLanguageChange, runRemoteCode, clearOutput
  } = useSocket(userName, roomId);

  const handleJoin = () => {
    if (roomId && userName) {
      const cleanId = roomId.trim().toLowerCase(); // Extra safety
      setRoomId(cleanId); // State ko update karein clean ID se

      socket.emit("join", { roomId: cleanId, userName });
      socket.emit("joinChat", { username: userName, roomId: cleanId });
      setJoined(true);
    } else {
      alert("Please enter Name and Room ID");
    }
  };
  const downloadCode = () => {
    // Map language names to file extensions
    const extensions = {
      javascript: "js",
      python: "py",
      java: "java",
      cpp: "cpp"
    };

    const ext = extensions[language] || "txt";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `code_${roomId}.${ext}`; // e.g., code_123.java
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleCopyId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    // Crash se bachne ke liye pehle onload define karein
    reader.onload = (event) => {
      const content = event.target.result;
      if (content) {
        // 1. Pehle local state update karein
        setCode(content);

        // 2. Phir socket ko bhejien (Agar socket active hai toh)
        if (socket && socket.connected) {
          emitCodeChange(content);

          const ext = file.name.split('.').pop().toLowerCase();
          const mapping = { js: 'javascript', py: 'python', java: 'java', cpp: 'cpp' };
          if (mapping[ext]) emitLanguageChange(mapping[ext]);
        }
      }
    };

    reader.onerror = (err) => {
      console.error("File reading failed:", err);
      alert("File padhne mein dikkat hui!");
    };

    reader.readAsText(file);
    e.target.value = ""; // Input reset karein taaki crash ke baad dubara chal sake
  };

  const handleAskAI = async () => {
    // Ensure we are using the correct Backend URL
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL 

    // Cleanup URL to avoid "https://site.com//ai/fix-code"
    const cleanBaseUrl = BACKEND_URL.replace(/\/+$/, "");
    const targetUrl = `${cleanBaseUrl}/ai/fix-code`;

    console.log("🚀 Requesting AI from:", targetUrl);

    setShowAI(true);
    setAiLoading(true);

    try {
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          error: lastError || "No specific error provided",
          language
        }),
      });

      // Handle non-OK responses (like 404 or 500)
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${res.status}`);
      }

      const data = await res.json();
      setAiExplanation(data.explanation);
      setAiFixedCode(data.fixedCode);

    } catch (err) {
      console.error("AI Fetch Error:", err);
      setAiExplanation(`⚠️ Connection Failed: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  if (!joined) {
    return (
      <JoinRoom
        roomId={roomId} setRoomId={setRoomId}
        userName={userName} setUserName={setUserName}
        onJoin={handleJoin}
      />
    );
  }

  return (
    <div className="editor-page">
      {/* LEFT SIDEBAR - Now with Scrollbar support */}
      <aside className="left-sidebar">
        <div className="card room-card">
          <p className="label">Code Room:</p>
          <h2 className="room-id-display">{roomId}</h2>
          <button className="btn-copy" onClick={handleCopyId}>
            Copy Id
          </button>
          {copied && <p className="copied-text">Copied!</p>}
        </div>

        <div className="section">
          <h3>Users in Room ({users.length}):</h3>
          <div className="user-badge">{userName}</div>
          <p className="typing-text">{typing}</p>
        </div>

        <div className="section">
          <select
            className="select-lang"
            value={language}
            onChange={(e) => emitLanguageChange(e.target.value)}
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python 3</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        <div className="control-buttons">
          <button className="btn-run" onClick={runRemoteCode} disabled={isRunning}>
            {isRunning ? "⏳ Running..." : "▶ Run Code"}
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept=".js,.py,.java,.cpp"
          />
          <button className="btn-upload" onClick={() => fileInputRef.current.click()}>
            📁 Upload
          </button>

          <button className="btn-clear" onClick={clearOutput}>
            🗑 Clear
          </button>

          <button className="btn-download" onClick={downloadCode}>
            💾 Save to File
          </button>
        </div>

        <div className="section output-section">
          <div className="output-header-row">
            <h3>Output:</h3>
            <button className="btn-zoom-trigger" onClick={() => setIsOutputZoomed(true)}>
              🔍 Zoom
            </button>
          </div>
          <div className="output-box small-view">
            <pre>{output || "No output yet. Click 'Run'"}</pre>
          </div>
          {lastError && (
            <button className="btn-ai-sidebar" onClick={handleAskAI}>
              💡 Fix with AI
            </button>
          )}
        </div>

        <button className="btn-leave" onClick={() => window.location.reload()}>
          Leave Room
        </button>
      </aside>

      {/* CENTER EDITOR & ZOOM PANEL */}
      <main className="editor-main">
        <div className="editor-container-inner">
          <CodeEditor
            language={language}
            code={code}
            userCount={users.length}
            onChange={(val) => {
              setCode(val);
              emitCodeChange(val);
            }}
          />

          {/* BOTTOM DOCKED TERMINAL (ZOOM VIEW) */}
          {isOutputZoomed && (
            <div className="bottom-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <span className="terminal-icon">$_</span>
                  <span>Console Output</span>
                </div>
                <div className="panel-actions">
                  {lastError && (
                    <button className="btn-ai-mini" onClick={handleAskAI}>
                      💡 AI Fix
                    </button>
                  )}
                  <button className="btn-close-panel" onClick={() => setIsOutputZoomed(false)}>
                    ×
                  </button>
                </div>
              </div>
              <div className="panel-content">
                <pre className={lastError ? "error-text" : "success-text"}>
                  {output || "No output to display."}
                </pre>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* RIGHT CHAT */}
      <aside className="right-sidebar">
        <ChatBox socket={socket} username={userName} roomId={roomId} />
      </aside>

      <AIPanel
        showAI={showAI}
        setShowAI={setShowAI}
        aiLoading={aiLoading}
        aiExplanation={aiExplanation}
        aiFixedCode={aiFixedCode}
        language={language}
        onReplaceCode={(newCode) => {
          setCode(newCode);
          emitCodeChange(newCode);
          setShowAI(false);
        }}
      />
      {/* <Footer /> */}
    </div>
    
  );
  
};

export default App;
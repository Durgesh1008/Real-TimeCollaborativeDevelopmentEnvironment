import React from 'react';
import Editor from "@monaco-editor/react";
import "./CodeEditor.css";
// Add userCount to the destructured props
const CodeEditor = ({ language, code, onChange, userCount }) => {
    return (
        <div className="editor-wrapper">
            <div className="editor-status">
                <span>📄 Editing in {language}</span>
                {/* Dynamically show the number of users */}
                <span style={{ opacity: 0.7 }}>
                    👥 {userCount || 0} {userCount === 1 ? "user" : "users"} connected
                </span>
            </div>
            <Editor
                height="calc(100vh - 80px)"
                language={language}
                value={code}
                theme="vs-dark"
                onChange={onChange}
                options={{
                    fontSize: 16,
                    minimap: { enabled: false },
                    wordWrap: "on",
                    automaticLayout: true,
                    padding: { top: 20 }
                }}
            />
        </div>
    );
};

export default CodeEditor;
import React from 'react';
import Editor from "@monaco-editor/react";
import "./AIPanel.css";
const AIPanel = ({
    showAI,
    setShowAI,
    aiLoading,
    aiExplanation,
    aiFixedCode,
    language,
    onReplaceCode
}) => {
    if (!showAI) return null;

    return (
        <div className="ai-panel">
            <div className="ai-header">
                <h2>🤖 AI Assistant</h2>
                <button onClick={() => setShowAI(false)} className="close-ai">
                    Close
                </button>
            </div>

            {aiLoading ? (
                <div className="ai-loader">
                    <div className="spinner"></div>
                    <p>Analyzing your code and error...</p>
                </div>
            ) : (
                <div className="ai-content">
                    <section className="ai-section">
                        <h3>Explanation:</h3>
                        <div className="explanation-text">
                            <pre>{aiExplanation}</pre>
                        </div>
                    </section>

                    {aiFixedCode && (
                        <section className="ai-section">
                            <h3>Fixed Code:</h3>
                            <div className="ai-editor-wrapper">
                                <Editor
                                    height="300px"
                                    language={language}
                                    value={aiFixedCode}
                                    theme="vs-dark"
                                    options={{
                                        readOnly: true,
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        lineNumbers: 'on'
                                    }}
                                />
                            </div>
                            <button
                                onClick={() => onReplaceCode(aiFixedCode)}
                                className="replace-button"
                            >
                                ✨ Replace My Code
                            </button>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

export default AIPanel;
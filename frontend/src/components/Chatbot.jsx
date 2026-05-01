import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../services/chatbotApi";

function SourcesPanel({ sources }) {
  const [open, setOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div style={{ marginTop: "0.75rem" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          background: "rgba(13, 27, 42, 0.06)",
          color: "#152238",
          border: "1px solid rgba(207, 213, 227, 0.8)",
          borderRadius: "10px",
          padding: "0.35rem 0.6rem",
          fontSize: "0.85rem",
          fontWeight: 700,
          cursor: "pointer",
          marginTop: 0,
        }}
      >
        {open ? "Hide sources" : "Show sources"} ({sources.length})
      </button>

      {open && (
        <div
          style={{
            marginTop: "0.5rem",
            padding: "0.75rem",
            borderRadius: "12px",
            border: "1px solid rgba(207, 213, 227, 0.8)",
            background: "#ffffff",
            color: "#152238",
            fontSize: "0.85rem",
            lineHeight: 1.45,
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {sources.map((s, i) => {
            const meta = s.metadata || {};
            const sourceFile = meta.source_file || "unknown";
            const chunkId = meta.chunk_id || "unknown";
            return (
              <div key={`${chunkId}-${i}`} style={{ marginBottom: "0.75rem" }}>
                <div style={{ fontWeight: 800, marginBottom: "0.25rem" }}>
                  {sourceFile} <span style={{ opacity: 0.7 }}>({chunkId})</span>
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{s.text}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chatbot({ recommendedModelIds = [], open, onOpenChange }) {
  const isOpen = open;
  const setOpen = onOpenChange;
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Ask something about BMWs - I only really know what is in the project notes, so weird questions might get vague answers.",
      sources: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userMessage, recommendedModelIds);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.answer, sources: response.sources || [] },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble right now. Please try again later.",
          sources: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`chatbot-fab${isOpen ? " chatbot-fab--active" : ""}`}
        onClick={() => setOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close BMW Assistant panel" : "Open BMW Assistant panel"}
      >
        <span className="chatbot-fab-icon" aria-hidden="true">
          +
        </span>
        <span className="chatbot-fab-label">BMW Assistant</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "20px",
            width: "380px",
            height: "600px",
            background: "linear-gradient(to bottom, #ffffff, #f8fafc)",
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(13, 27, 42, 0.3), 0 8px 24px rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1001,
            border: "1px solid rgba(207, 213, 227, 0.5)",
            overflow: "hidden",
            animation: "slideUp 0.3s ease-out",
          }}
        >
          <div
            style={{
              padding: "1.25rem 1.5rem",
              background: "linear-gradient(135deg, #0d1b2a, #1b263b)",
              color: "#f0f4ff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#4ade80",
                  boxShadow: "0 0 8px rgba(74, 222, 128, 0.6)",
                }}
              />
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "600", letterSpacing: "0.3px" }}>
                BMW Assistant
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                color: "#f0f4ff",
                fontSize: "1.5rem",
                cursor: "pointer",
                padding: "0.25rem 0.5rem",
                borderRadius: "6px",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.2)")}
              onMouseLeave={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.1)")}
              aria-label="Close chatbot"
            >
              X
            </button>
          </div>

          <div
            className="chatbot-messages"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              background: "linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "92%",
                }}
              >
                <div
                  style={{
                    padding: "0.875rem 1.125rem",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #0d1b2a, #1b263b)"
                        : "linear-gradient(to bottom, #f0f4ff, #e8edf7)",
                    color: msg.role === "user" ? "#f0f4ff" : "#152238",
                    boxShadow:
                      msg.role === "user"
                        ? "0 2px 8px rgba(13, 27, 42, 0.2)"
                        : "0 2px 6px rgba(21, 34, 56, 0.08)",
                    fontSize: "0.95rem",
                    lineHeight: "1.5",
                    wordWrap: "break-word",
                  }}
                >
                  {msg.content}
                </div>

                {msg.role === "assistant" && <SourcesPanel sources={msg.sources} />}
              </div>
            ))}
            {isLoading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  padding: "0.875rem 1.125rem",
                  borderRadius: "16px 16px 16px 4px",
                  background: "linear-gradient(to bottom, #f0f4ff, #e8edf7)",
                  color: "#152238",
                  boxShadow: "0 2px 6px rgba(21, 34, 56, 0.08)",
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#1b263b",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSend}
            style={{
              padding: "1.25rem 1.5rem",
              borderTop: "1px solid rgba(207, 213, 227, 0.5)",
              display: "flex",
              gap: "0.75rem",
              background: "#ffffff",
              boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.05)",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about BMW..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                border: "1px solid #cfd5e3",
                borderRadius: "10px",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                background: "#f8fafc",
                transition: "all 0.2s ease",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#1b263b";
                e.target.style.background = "#ffffff";
                e.target.style.boxShadow = "0 0 0 3px rgba(27, 38, 59, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#cfd5e3";
                e.target.style.background = "#f8fafc";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                padding: "0.75rem 1.5rem",
                background: isLoading || !input.trim()
                  ? "linear-gradient(135deg, #94a3b8, #cbd5e1)"
                  : "linear-gradient(135deg, #0d1b2a, #1b263b)",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                fontSize: "0.95rem",
                fontWeight: "600",
                transition: "all 0.2s ease",
                boxShadow: isLoading || !input.trim()
                  ? "none"
                  : "0 2px 8px rgba(13, 27, 42, 0.2)",
              }}
              onMouseEnter={(e) => {
                if (!isLoading && input.trim()) {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(13, 27, 42, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && input.trim()) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 8px rgba(13, 27, 42, 0.2)";
                }
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }
        .chatbot-messages::-webkit-scrollbar-track {
          background: transparent;
        }
        .chatbot-messages::-webkit-scrollbar-thumb {
          background: rgba(13, 27, 42, 0.2);
          border-radius: 3px;
        }
        .chatbot-messages::-webkit-scrollbar-thumb:hover {
          background: rgba(13, 27, 42, 0.3);
        }
      `}</style>
    </>
  );
}

export default Chatbot;


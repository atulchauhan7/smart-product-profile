import { useState, FC, KeyboardEvent, useRef, useEffect, useCallback } from "react";
import { MessageRenderer } from "./MessageRenderer";
import "../styles/ai-agent.css";
import { ChatMessage } from "../types";
import {
  MAX_FILES,
  ALLOWED_FILE_EXTENSIONS,
  AI_RESPONSE_DELAY,
  COPY_FEEDBACK_DURATION,
  EDITOR_MAX_HEIGHT,
  INITIAL_MESSAGES,
} from "../constants";
import {
  filterValidFiles,
  isImageContent,
} from "../utils/helpers";
import { generateDummyResponse } from "../utils/aiResponses";

interface AIAgentProps {
  onProposeChanges?: (newContent: string) => void;
  onConfidenceScoreChange?: (score: number) => void;
}

type ChatMessageWithAttachment = ChatMessage & {
  attachments?: File[];
};

export const AIAgent: FC<AIAgentProps> = ({
  onProposeChanges,
  onConfidenceScoreChange,
}) => {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageWithAttachment[]>(
    INITIAL_MESSAGES as ChatMessageWithAttachment[]
  );

  const [inputValue, setInputValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [confidenceScore] = useState(20);
  const [showTooltip, setShowTooltip] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (onConfidenceScoreChange) {
      onConfidenceScoreChange(confidenceScore);
    }
  }, [confidenceScore, onConfidenceScoreChange]);

  const addFiles = useCallback((files: File[]): void => {
    setSelectedFiles((prev) => {
      const merged = [...prev, ...files];
      return merged.slice(0, MAX_FILES);
    });
  }, []);

  const autoResizeTextarea = useCallback((): void => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, EDITOR_MAX_HEIGHT);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > EDITOR_MAX_HEIGHT ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCopyMessage = useCallback((messageId: string, content: string): void => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, COPY_FEEDBACK_DURATION);
    });
  }, []);

  const handleSendMessage = useCallback((): void => {
    if (inputValue.trim()) {
      const newMessage: ChatMessageWithAttachment = {
        id: Date.now().toString(),
        role: "user",
        content: inputValue,
        timestamp: new Date(),
        attachments: selectedFiles,
      };

      setMessages([...messages, newMessage]);
      const userInput = inputValue;
      setInputValue("");
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.overflowY = "hidden";
        }
      }, 0);
      setSelectedFiles([]);

      // Simulate AI response with delay
      setTimeout(() => {
        const dummyResponse = generateDummyResponse(userInput);
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: dummyResponse,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);

        // Check if response contains HTML content changes
        const isHTML = dummyResponse.trim().startsWith("<") && dummyResponse.includes("</");
        if (isHTML && onProposeChanges) {
          onProposeChanges(dummyResponse);
        }
      }, AI_RESPONSE_DELAY);
    }
  }, [inputValue, selectedFiles, messages, onProposeChanges]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>): void => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>): void => {
      const files = Array.from(e.clipboardData.files || []);
      const validFiles = filterValidFiles(files, ALLOWED_FILE_EXTENSIONS);

      if (validFiles.length > 0) {
        e.preventDefault();
        addFiles(validFiles);
      }
    },
    [addFiles]
  );

  return (
    <div className="ai-agent">
      <div className="ai-header">
        <span className="ai-title">Planning Assistant</span>
      </div>

      <div className="confidence-section">
        <div className="confidence-label">
          <span>Confidence score</span>{" "}
          <span className="info-icon-wrapper">
            <button
              className="info-button"
              onClick={() => setShowTooltip(!showTooltip)}
              onBlur={() => setShowTooltip(false)}
            >
              <img
                src="./src/assets/info.svg"
                alt="Info"
                className="info-icon"
              />
            </button>
            {showTooltip && (
              <span className="tooltip">
                An estimation of how much info you've provided. You must have a
                score of 80% or higher to submit
              </span>
            )}
          </span>{" "}
          <span className="score-number">{confidenceScore}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${confidenceScore}%` }}
          ></div>
        </div>
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-content">
                {!isImageContent(message.content) && (
                  <button
                    className="message-copy-btn"
                    onClick={() =>
                      handleCopyMessage(message.id, message.content)
                    }
                    title="Copy message"
                  >
                    {copiedMessageId === message.id ? (
                      <span className="copy-text">Copied!</span>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    )}
                  </button>
                )}
                <MessageRenderer content={message.content} />
                {message.attachments && message.attachments.length > 0 && (
                  <div className="message-attachments">
                    {message.attachments.map((file, index) => (
                      <div key={index} className="message-attachment">
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="input-section">
        <div className="input-container">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              autoResizeTextarea();
            }}
            onKeyDown={handleKeyPress}
            onPaste={handlePaste}
            placeholder="How can I help?"
            rows={1}
            className="chat-input resize-none overflow-hidden max-h-[96px] leading-6"
          />
          <div className="input-actions">
            <label className="upload-btn">
              <div>
                <img
                  src="/src/assets/paperclip.svg"
                  alt="Attach"
                  className="attach-icon"
                />
              </div>
              <input
                type="file"
                hidden
                multiple
                accept=".docx,.txt,.pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const allowedExtensions = [
                    ".docx",
                    ".txt",
                    ".pdf",
                    ".png",
                    ".jpg",
                    ".jpeg",
                  ];
                  const validFiles = files.filter((file) => {
                    const fileName = file.name.toLowerCase();
                    return allowedExtensions.some((ext) =>
                      fileName.endsWith(ext),
                    );
                  });
                  addFiles(validFiles);
                }}
              />
            </label>
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() && selectedFiles.length === 0}
            >
              ↑
            </button>
          </div>
        </div>
        {selectedFiles.length > 0 && (
          <div className="selected-files">
            {selectedFiles.map((file, index) => (
              <div key={index} className="selected-file">
                {file.name}
                <button
                  className="remove-file-btn"
                  onClick={() =>
                    setSelectedFiles((prev) =>
                      prev.filter((_, i) => i !== index),
                    )
                  }
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="ai-disclaimer">
          AI-generated responses may contain errors. Always verify accuracy.
        </div>
      </div>
    </div>
  );
};

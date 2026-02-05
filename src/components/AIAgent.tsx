import { useState, FC, KeyboardEvent, useRef, useEffect } from "react";
import { MessageRenderer } from "./MessageRenderer";
import "../styles/ai-agent.css";
import "../styles/message-renderer.css";
import { ChatMessage } from "../types";

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

  const [messages, setMessages] = useState<ChatMessageWithAttachment[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "👋 **Welcome to Smart Product Profile!**\n\nHow can I assist you today?\n\nTry asking me to:\n- `improve` your content\n- Show `feature` suggestions\n- `change` or `rewrite` text\n- Display an `image` preview",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      role: "user",
      content: "Will third parties be accessing this tool?",
      timestamp: new Date(Date.now() - 120000),
    },
    {
      id: "3",
      role: "assistant",
      content:
        "**No.** This tool will only be for *Lilly employees* and use their existing Lilly accounts to log in. Secure authentication✅ Internal use only",
      timestamp: new Date(Date.now() - 60000),
    },
    {
      id: "4",
      role: "user",
      content:
        "I've written a paragraph about Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // const [confidenceScore, setConfidenceScore] = useState(70); 
  const [confidenceScore] = useState(20); 
  const [showTooltip, setShowTooltip] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const LINE_HEIGHT = 24;
  const MAX_LINES = 5;
  const MAX_HEIGHT = LINE_HEIGHT * MAX_LINES;

  const MAX_FILES = 3;

  useEffect(() => {
    if (onConfidenceScoreChange) {
      onConfidenceScoreChange(confidenceScore);
    }
  }, [confidenceScore, onConfidenceScoreChange]);

  const addFiles = (files: File[]) => {
    setSelectedFiles((prev) => {
      const merged = [...prev, ...files];
      return merged.slice(0, MAX_FILES);
    });
  };

  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";

    const newHeight = Math.min(textarea.scrollHeight, MAX_HEIGHT);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCopyMessage = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    });
  };

  const isHTMLContent = (content: string): boolean => {
    return content.trim().startsWith("<") && content.includes("</");
  };

  const isImageContent = (content: string): boolean => {
    try {
      const trimmed = content.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const parsed = JSON.parse(trimmed);
        return parsed && parsed.type === 'image';
      }
    } catch {
      return false;
    }
    return false;
  };

  const generateDummyResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    const dummyResponses: { [key: string]: string } = {
      improve:
        "Great question! Here are some suggestions to **improve** your product description:\n\n1. Add specific benefits and use cases\n2. Include quantifiable metrics or data\n3. Highlight what makes your product unique\n4. Use `clear, concise` language\n5. Consider adding customer testimonials\n\n> Would you like me to expand on any of these suggestions?",

      feature:
        "Your product description should clearly highlight:\n\n- **Core features** and functionality\n- **Key benefits** for the user\n- **Target audience**\n- **Pricing** or value proposition\n- How it **solves customer problems**\n\nMake sure each feature is explained in terms of user benefits!",

      tone: 'Based on your current content, I\'d recommend:\n\n• Use a professional yet approachable tone\n• Avoid overly technical jargon for general audiences\n• Use active voice (e.g., "Transform your workflow" instead of "Your workflow will be transformed")\n• Be specific about benefits rather than vague claims\n\nThis will make your product more appealing to potential customers.',

      grammar:
        "Your content looks good from a grammar perspective! A few tips:\n\n• Keep sentences concise (15-20 words)\n• Use short paragraphs (2-3 sentences)\n• Break up longer sections with bullet points\n• Ensure consistent tense throughout\n• Proofread for typos and formatting\n\nConsistency and clarity are key!",

      change: JSON.stringify({
        type: "change",
        change: {
          old_msg: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          new_msg:
            "**Lorem ipsum** is a sophisticated placeholder text widely utilized across *graphic design*, publishing, and web development industries.\n\nIt enables designers to create page layouts without being distracted by meaningful content.",
        },
      }),

      image: JSON.stringify({
        type: "image",
        image: {
          url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQykzoZeCE0p7LeuyHnLYCdPP2jju9d5PaMeA&s",
          alt: "Product Preview Image",
        },
      }),

      gif: JSON.stringify({
        type: "image",
        image: {
          url: "/src/assets/grabill54-gift-9817.gif",
          alt: "Local GIF Preview",
        },
      }),

      rewrite: `<h2>General Information</h2>
<p>Lorem ipsum is a dummy or placeholder text commonly used in graphic design, publishing, and web development. Its purpose is to permit a page layout to be designed, independently of the copy that will subsequently populate it, or to demonstrate various fonts of a typeface without meaningful text that could be distracting.</p>
 
<p>Lorem ipsum is typically a corrupted version of De finibus bonorum et malorum, a 1st-century BC text by the Roman statesman and philosopher Cicero, with words altered, added, and removed to make it nonsensical and improper Latin. The first two words are the truncation of dolorem ipsum ("pain itself").</p>
 
<h2>Data Information</h2>
<p>Versions of the Lorem ipsum text have been used in typesetting since the 1960s, when advertisements for Letraset transfer sheets popularized it. Lorem ipsum was introduced to the digital world in the mid-1980s, when Aldus employed it in graphic and word-processing templates for its desktop publishing program PageMaker.</p>
 
<h2>Legal Information</h2>
<p>Lorem dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
 
<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`,

      default:
        "That's an excellent point! Here's my feedback:\n\nYour product description has a solid foundation. To make it even better:\n\n1. **Be More Specific** - Add concrete examples and use cases\n2. **Highlight Unique Value** - What sets this product apart?\n3. **Focus on Benefits** - How does this solve customer problems?\n4. **Improve Clarity** - Simplify complex concepts\n5. **Add Social Proof** - Include customer testimonials or case studies\n\nWould you like me to suggest changes for any specific section?",
    };

    // Check which keyword matches the user input
    for (const [keyword, response] of Object.entries(dummyResponses)) {
      if (keyword !== "default" && lowerMessage.includes(keyword)) {
        return response;
      }
    }
    return dummyResponses.default;
  };

  const handleSendMessage = () => {
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

      // Simulate confidence score increase 
      // setConfidenceScore((prev) => Math.min(prev + 5, 100));

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
        if (isHTMLContent(dummyResponse) && onProposeChanges) {
          onProposeChanges(dummyResponse);
        }
      }, 800);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

 const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
  const files = Array.from(e.clipboardData.files || []);
  
  const allowedExtensions = ['.docx', '.txt', '.pdf', '.png', '.jpg', '.jpeg'];
  
  const validFiles = files.filter((file) => {
    const fileName = file.name.toLowerCase();
    return allowedExtensions.some(ext => fileName.endsWith(ext));
  });

  if (validFiles.length > 0) {
    e.preventDefault();
    addFiles(validFiles);
    
    if (validFiles.length < files.length) {
      console.log('Some files were rejected. Only .docx, .txt, .pdf, and image files are allowed.');
    }
  }
};

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
    onMouseEnter={() => setShowTooltip(true)}
    onMouseLeave={() => setShowTooltip(false)}
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
</span>
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
                    onClick={() => handleCopyMessage(message.id, message.content)}
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
              <img
                src="/src/assets/paperclip.svg"
                alt="Attach"
                className="attach-icon"
              />
            <input
  type="file"
  hidden
  multiple
  accept=".docx,.txt,.pdf,.png,.jpg,.jpeg"
  onChange={(e) => {
    const files = Array.from(e.target.files || []);
    const allowedExtensions = ['.docx', '.txt', '.pdf', '.png', '.jpg', '.jpeg'];
    const validFiles = files.filter((file) => {
      const fileName = file.name.toLowerCase();
      return allowedExtensions.some(ext => fileName.endsWith(ext));
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
                      prev.filter((_, i) => i !== index)
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
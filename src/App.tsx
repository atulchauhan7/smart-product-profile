import { useState, useRef, useEffect } from "react";
import { Header } from "./components/Header";
import { TextEditor } from "./components/TextEditor";
import { AIAgent } from "./components/AIAgent";
import "./styles/app.css";

type LayoutMode = "full" | "editor-expanded" | "ai-expanded";

function App() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("full");
  const [editorWidth, setEditorWidth] = useState(50); // Default 50% width
  const [isDragging, setIsDragging] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(50);

  // Load saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("editorWidth");
    if (saved) {
      const width = parseInt(saved);
      setEditorWidth(width);
      widthRef.current = width;
    }
  }, []);

  // Handle dragging the divider - optimized for smooth cursor-following
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;

      // Constrain between 20% and 80%
      if (newWidth >= 20 && newWidth <= 80) {
        widthRef.current = newWidth;
        setEditorWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Save preference to localStorage
      localStorage.setItem("editorWidth", widthRef.current.toFixed(2));
    };

    // Attach listeners with high priority
    document.addEventListener("mousemove", handleMouseMove, {
      capture: true,
      passive: true,
    });
    document.addEventListener("mouseup", handleMouseUp, { capture: true });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove, true);
      document.removeEventListener("mouseup", handleMouseUp, true);
    };
  }, [isDragging]);

  const handleEditorCollapse = () => {
    setLayoutMode(
      layoutMode === "editor-expanded" ? "full" : "editor-expanded",
    );
  };

  const handleAICollapse = () => {
    setLayoutMode(layoutMode === "ai-expanded" ? "full" : "ai-expanded");
  };

  return (
    <div className="app">
      <Header onSubmitReview={() => alert("Submit for review clicked")} />

      <div className="main-container" ref={containerRef}>
        {/* Left Sidebar */}
        <aside className={`left-sidebar ${leftSidebarOpen ? "open" : "collapsed"}`}>
          <div className="sidebar-header">
            <button 
              className="sidebar-toggle"
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              title={leftSidebarOpen ? "Collapse" : "Expand"}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
          </div>
          
          <nav className="sidebar-nav">
            <button className="nav-item active">
              <span className="nav-icon">📋</span>
              <span className="nav-label">Product details</span>
            </button>
            <button className="nav-item">
              <span className="nav-icon">✉️</span>
              <span className="nav-label">Invite</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div
          className={`layout ${layoutMode} ${isDragging ? "dragging" : ""}`}
          style={{
            gridTemplateColumns:
              layoutMode === "full" && window.innerWidth > 768
                ? `${editorWidth}% 1px ${100 - editorWidth}%`
                : undefined,
          }}
        >
          <div className="editor-panel">
            <TextEditor onCollapse={handleEditorCollapse} />
          </div>

          {layoutMode === "full" && (
            <div
              className={`resize-divider ${isDragging ? "dragging" : ""}`}
              onMouseDown={() => setIsDragging(true)}
            >
              <div className="divider-buttons">
                {/* Reserved for future buttons */}
              </div>
            </div>
          )}

          <div className="ai-panel">
            <AIAgent onCollapse={handleAICollapse} />
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="right-sidebar">
          <div className="sidebar-nav right-nav">
            <button className="nav-item-icon" title="Settings" aria-label="Settings">
              ⚙️
            </button>
            <button className="nav-item-icon" title="Copy" aria-label="Copy">
              📋
            </button>
            <button className="nav-item-icon" title="Share" aria-label="Share">
              🔗
            </button>
            <button className="nav-item-icon" title="More" aria-label="More options">
              ⋮
            </button>
          </div>
        </aside>

        {/* Mobile overlay buttons */}
        <div className="mobile-overlay-buttons">
          {layoutMode === "full" && (
            <>
              <button
                className="overlay-btn overlay-btn-left"
                onClick={handleEditorCollapse}
                title="Expand Editor"
                aria-label="Expand Editor"
              >
                ✏️
              </button>
              <button
                className="overlay-btn overlay-btn-right"
                onClick={handleAICollapse}
                title="Expand AI"
                aria-label="Expand AI"
              >
                🤖
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

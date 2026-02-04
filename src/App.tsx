import { useState, useRef, useEffect } from "react";
import { TextEditor } from "./components/TextEditor";
import { AIAgent } from "./components/AIAgent";
import "./styles/app.css";

type LayoutMode = "full" | "editor-expanded" | "ai-expanded";

function App() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("full");
  const [editorWidth, setEditorWidth] = useState(50); // Default 50% width
  const [isDragging, setIsDragging] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [proposedChanges, setProposedChanges] = useState<string | null>(null);
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

  const handleApplyChanges = () => {
    setProposedChanges(null);
  };

  const handleRejectChanges = () => {
    setProposedChanges(null);
  };

  return (
    <div className="app">
      <div className="main-container" ref={containerRef}>
        {/* Left Sidebar */}
        <aside
          className={`left-sidebar ${leftSidebarOpen ? "open" : "collapsed"}`}
        >
          <div className="sidebar-header">
            <button
              className="sidebar-toggle"
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              title={leftSidebarOpen ? "Collapse" : "Expand"}
              aria-label="Toggle sidebar"
            >
              <span>
                <img
                  src="/src/assets/panel-left.svg"
                  alt="panel"
                  className="panel-left"
                />
              </span>
              <span className="sidebar-logo">
                <img
                  src="/src/assets/lilly-black-logo.png"
                  alt="lilly"
                  className="lilly-logo"
                />
                <span className="logo-text">Smart Product Profile</span>
              </span>
            </button>
          </div>

          <nav className="sidebar-nav" >
            <button  className="nav-item active" onClick={handleEditorCollapse}>
              <span>
                <img
                  src="/src/assets/file-text.svg"
                  alt="Product details"
                  className="product-icon"
                />
              </span>
              <span className="nav-label">Product details</span>
            </button>
            <button className="nav-item">
              <span>
                <img
                  src="/src/assets/users.svg"
                  alt="Invite"
                  className="invite-icon"
                />
              </span>
              <span className="nav-label">Collaborators</span>
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
            <TextEditor
              onCollapse={handleEditorCollapse}
              proposedChanges={proposedChanges}
              onAcceptChanges={handleApplyChanges}
              onRejectChanges={handleRejectChanges}
            />
          </div>

          {layoutMode === "full" && (
            <div
              className={`resize-divider ${isDragging ? "dragging" : ""}`}
              onMouseDown={() => setIsDragging(true)}
            >
              <div className="divider-buttons">
              </div>
            </div>
          )}

          <div className="ai-panel">
            <AIAgent
              onProposeChanges={setProposedChanges}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="right-sidebar">
          <div className="sidebar-nav right-nav">
            <button className="nav-item-icon" title="Panel" aria-label="Panel">
            <img src="/src/assets/panel-right.svg" alt="message"/>
            </button>
            <button  className="nav-item-icon" title="message" aria-label="Message">
            <img src="/src/assets/message.svg" alt="message"/>
            </button>
            <button  className="nav-item-icon" title="Lines" aria-label="Lines">
            <img src="/src/assets/liners.svg" alt="liners"/>
            </button>
             <button  className="nav-item-icon" title="Book" aria-label="Book">
            <img src="/src/assets/lightbulb.svg" alt="book" />
            </button>
             <button  className="nav-item-icon" title="Book" aria-label="Book">
            <img src="/src/assets/book.svg" alt="book" />
            </button>
             <button
              className="nav-item-icon"
              title="Time Doc"
              aria-label="Time Doc"
            >
              <img src="/src/assets/file-clock.svg" alt="clock" className="file-clock" />
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

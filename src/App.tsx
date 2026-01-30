import { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { TextEditor } from './components/TextEditor';
import { AIAgent } from './components/AIAgent';
import './styles/app.css';

type LayoutMode = 'full' | 'editor-expanded' | 'ai-expanded';

function App() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('full');
  const [editorWidth, setEditorWidth] = useState(50); // Default 50% width
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('editorWidth');
    if (saved) {
      setEditorWidth(parseInt(saved));
    }
  }, []);

  // Handle dragging the divider
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;

      // Constrain between 20% and 80% with smooth updates
      if (newWidth >= 20 && newWidth <= 80) {
        setEditorWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Save preference to localStorage
      localStorage.setItem('editorWidth', editorWidth.toString());
    };

    // Use capturing phase for better responsiveness
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('mouseup', handleMouseUp, true);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('mouseup', handleMouseUp, true);
    };
  }, [isDragging, editorWidth]);

  const handleEditorCollapse = () => {
    setLayoutMode(layoutMode === 'editor-expanded' ? 'full' : 'editor-expanded');
  };

  const handleAICollapse = () => {
    setLayoutMode(layoutMode === 'ai-expanded' ? 'full' : 'ai-expanded');
  };

  // const handleEditorMinimize = () => {
  //   setEditorWidth(10);
  //   localStorage.setItem('editorWidth', '10');
  // };

  // const handleAIMinimize = () => {
  //   setEditorWidth(90);
  //   localStorage.setItem('editorWidth', '90');
  // };

  return (
    <div className="app">
      <Header onSubmitReview={() => alert('Submit for review clicked')} />
      
      <div className="main-container" ref={containerRef}>
        <div 
          className={`layout ${layoutMode}`}
          style={{
            gridTemplateColumns: layoutMode === 'full' && window.innerWidth > 768
              ? `${editorWidth}% 1px ${100 - editorWidth}%`
              : undefined
          }}
        >
          <div className="editor-panel">
            <TextEditor onCollapse={handleEditorCollapse} />
          </div>
          
          {layoutMode === 'full' && (
            <div 
              className={`resize-divider ${isDragging ? 'dragging' : ''}`}
              onMouseDown={() => setIsDragging(true)}
            >
              <div className="divider-buttons">
                {/* <button
                  className="divider-btn divider-btn-editor"
                  onClick={handleEditorMinimize}
                  title="Minimize editor (10%)"
                  aria-label="Minimize editor"
                >
                  ◀
                </button> */}
                {/* <button
                  className="divider-btn divider-btn-ai"
                  onClick={handleAIMinimize}
                  title="Minimize AI (10%)"
                  aria-label="Minimize AI"
                >
                  ▶
                </button> */}
              </div>
            </div>
          )}
          
          <div className="ai-panel">
            <AIAgent onCollapse={handleAICollapse} />
          </div>
        </div>

        {/* Mobile overlay buttons */}
        <div className="mobile-overlay-buttons">
          {layoutMode === 'full' && (
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

import { useState } from 'react';
import { Header } from './components/Header';
import { TextEditor } from './components/TextEditor';
import { AIAgent } from './components/AIAgent';
import './styles/app.css';

type LayoutMode = 'full' | 'editor-expanded' | 'ai-expanded';

function App() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('full');

  const handleEditorCollapse = () => {
    setLayoutMode(layoutMode === 'editor-expanded' ? 'full' : 'editor-expanded');
  };

  const handleAICollapse = () => {
    setLayoutMode(layoutMode === 'ai-expanded' ? 'full' : 'ai-expanded');
  };

  return (
    <div className="app">
      <Header onSubmitReview={() => alert('Submit for review clicked')} />
      
      <div className="main-container">
        <div className={`layout ${layoutMode}`}>
          {layoutMode !== 'ai-expanded' && (
            <div className="editor-panel">
              <TextEditor onCollapse={handleEditorCollapse} />
            </div>
          )}
          
          {layoutMode !== 'editor-expanded' && (
            <div className="ai-panel">
              <AIAgent onCollapse={handleAICollapse} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

import { useState, FC, ChangeEvent, useRef } from 'react';
import '../styles/text-editor.css';

interface TextEditorProps {
  onCollapse: () => void;
}

export const TextEditor: FC<TextEditorProps> = ({ onCollapse }) => {
  const [title, setTitle] = useState('My Fancy Product Name');
  const [content, setContent] = useState(`General Information
Lorem ipsum is a dummy or placeholder text commonly used in graphic design, publishing, and web development. Its purpose is to permit a page layout to be designed, independently of the copy that will subsequently populate it, or to demonstrate various fonts of a typeface without meaningful text that could be distracting.

Lorem ipsum is typically a corrupted version of De finibus bonorum et malorum, a 1st-century BC text by the Roman statesman and philosopher Cicero, with words altered, added, and removed to make it nonsensical and improper Latin. The first two words are the truncation of dolorem ipsum ("pain itself").

Data Information
Versions of the Lorem ipsum text have been used in typesetting since the 1960s, when advertisements for Letraset transfer sheets popularized it.[1] Lorem ipsum was introduced to the digital world in the mid-1980s, when Aldus employed it in graphic and word-processing templates for its desktop publishing program PageMaker. Other popular word processors, including Pages and Microsoft Word, have since adopted Lorem ipsum,[2] as have many LaTeX packages,[3][4][5] web content managers such as Joomla! and WordPress, and CSS libraries such as Semantic UI.

Legal Information
Lorem dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Lorem ipsum header
Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt, explicabo.`);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = () => {
    if (contentRef.current) {
      setContent(contentRef.current.innerText);
    }
  };

  const applyFormat = (command: string, value?: string) => {
    // Focus on the contenteditable div first
    if (contentRef.current) {
      contentRef.current.focus();
    }
    // Use setTimeout to ensure focus is applied before executing command
    setTimeout(() => {
      document.execCommand(command, false, value);
    }, 0);
  };

  return (
    <div className="text-editor">
      <div className="editor-header">
        <div className="editor-header-left">
          <input
            type="text"
            className="editor-title"
            value={title}
            onChange={handleTitleChange}
            placeholder="Enter product name"
          />
          <span className="edit-icon">✏️</span>
        </div>
        <button className="collapse-btn" onClick={onCollapse} title="Collapse editor">
          ◀
        </button>
      </div>

      <div className="editor-tabs">
        <button className="tab-btn active">Overview</button>
        <button className="tab-btn">Details</button>
      </div>

      <div className="toolbar">
        <button className="toolbar-btn" onClick={() => applyFormat('bold')} title="Bold">
          <strong>B</strong>
        </button>
        <button className="toolbar-btn" onClick={() => applyFormat('italic')} title="Italic">
          <em>I</em>
        </button>
        <button className="toolbar-btn" onClick={() => applyFormat('underline')} title="Underline">
          <u>U</u>
        </button>
        <button className="toolbar-btn" title="Font size">AA</button>
        <div className="toolbar-divider"></div>
        <button className="toolbar-btn" title="Bullet list">•</button>
        <button className="toolbar-btn" title="Number list">1.</button>
        <button className="toolbar-btn" title="Quote">❝</button>
        <button className="toolbar-btn" title="Decrease indent">↤</button>
        <div className="toolbar-divider"></div>
        <button className="toolbar-btn" title="Link">🔗</button>
        <button className="toolbar-btn" title="Image">🖼️</button>
        <button className="toolbar-btn" title="File">📎</button>
        <button className="toolbar-btn" title="Mention">@</button>
      </div>

      <div
        ref={contentRef}
        className="editor-content"
        contentEditable
        onInput={handleContentChange}
        suppressContentEditableWarning
        role="textbox"
        aria-label="Editor content"
      >
        {content}
      </div>
    </div>
  );
};

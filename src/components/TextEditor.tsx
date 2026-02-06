import { useState, FC, ChangeEvent, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { DiffViewer } from "./DiffViewer";
import LinkModal from "./LinkModal";
import '../styles/text-editor.css';
import { Indent } from '../extension/Indent';
 
interface TextEditorProps {
  proposedChanges?: string | null;
  onAcceptChanges?: (newContent: string) => void;
  onRejectChanges?: () => void;
  confidenceScore: number; 
}
 
const transformTextCase = (text: string, type: string) => {
  switch (type) {
    case 'upper': 
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'sentence':
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case 'capitalize':
      return text
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    default:
      return text;
  }
};

export const TextEditor: FC<TextEditorProps> = ({ 
  proposedChanges,
  onAcceptChanges,
  onRejectChanges,
  confidenceScore, 
}) => {
  const [title, setTitle] = useState('Untitled Product');
  const [, forceUpdate] = useState(0);

  const [showCaseMenu, setShowCaseMenu] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initialContent = `<h2>General Information</h2>
<p>Lorem ipsum is a dummy or placeholder text commonly used in graphic design, publishing, and web development. Its purpose is to permit a page layout to be designed, independently of the copy that will subsequently populate it, or to demonstrate various fonts of a typeface without meaningful text that could be distracting.</p>
 
<p>Lorem ipsum is typically a corrupted version of De finibus bonorum et malorum, a 1st-century BC text by the Roman statesman and philosopher Cicero, with words altered, added, and removed to make it nonsensical and improper Latin. The first two words are the truncation of dolorem ipsum ("pain itself").</p>
 
<h2>Data Information</h2>
<p>Versions of the Lorem ipsum text have been used in typesetting since the 1960s, when advertisements for Letraset transfer sheets popularized it. Lorem ipsum was introduced to the digital world in the mid-1980s, when Aldus employed it in graphic and word-processing templates for its desktop publishing program PageMaker.</p>
 
<h2>Legal Information</h2>
<p>Lorem dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
 
<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Indent,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
    ],
    content: initialContent,
    onSelectionUpdate: () => {
      forceUpdate((n) => n + 1);
    },
    onUpdate: () => {
      forceUpdate((n) => n + 1);
    },
    editorProps: {
      attributes: {
        class: "editor-content",
      },
    },
  });
 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCaseMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (editor && !editor.state.selection.empty) {
          setShowLinkModal(true);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

 const applyCase = (type: 'sentence' | 'lower' | 'upper' | 'capitalize') => {
  if (!editor) return;
  const { from, to, empty } = editor.state.selection;
  if (empty) return; 

  const selectedText = editor.state.doc.textBetween(from, to, ' ');
  const newText = transformTextCase(selectedText, type);

  editor.chain().focus().insertContentAt({ from, to }, newText).run();
  setShowCaseMenu(false);
};
  const handleInsertLink = (url: string, openInNewTab: boolean) => {
    if (!editor) return;

    const { empty } = editor.state.selection;
    
    if (empty) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}" ${openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : ''}>${url}</a>`)
        .run();
    } else {
      editor
        .chain()
        .focus()
        .setLink({ 
          href: url,
          target: openInNewTab ? '_blank' : undefined,
          rel: openInNewTab ? 'noopener noreferrer' : undefined,
        })
        .run();
    }

    setShowLinkModal(false);
  };

  const getSelectedText = () => {
    if (!editor) return '';
    const { from, to, empty } = editor.state.selection;
    if (empty) return '';
    return editor.state.doc.textBetween(from, to, ' ');
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleAccept = () => {
    if (editor && proposedChanges) {
      editor.commands.setContent(proposedChanges);
      if (onAcceptChanges) {
        onAcceptChanges(proposedChanges);
      }
    }
  };

  const handleReject = () => {
    if (onRejectChanges) {
      onRejectChanges();
    }
  };

  const handleSubmitForReview = () => {
    if (confidenceScore >= 80) {
      alert("Submit for review clicked");
    }
  };

  if (!editor) {
    return null;
  }

  const toggleFormat = (format: string) => {
    switch (format) {
      case "bold":
        editor.chain().focus().toggleBold().run();
        break;
      case "italic":
        editor.chain().focus().toggleItalic().run();
        break;
      case "underline":
        editor.chain().focus().toggleUnderline().run();
        break;
      case "bullet":
        editor.chain().focus().toggleBulletList().run();
        break;
      case "ordered":
        editor.chain().focus().toggleOrderedList().run();
        break;
      case "blockquote":
        editor.chain().focus().toggleBlockquote().run();
        break;
      default:
        break;
    }
  };

  const isSubmitDisabled = confidenceScore < 80;
 
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
        </div>
        <button
          className={`submit-review-btn ${isSubmitDisabled ? 'disabled' : ''}`}
          onClick={handleSubmitForReview}
          disabled={isSubmitDisabled}
          title={isSubmitDisabled ? `Confidence score must be 80% or higher to submit (current: ${confidenceScore}%)` : "Submit for review"}
        >
          Submit for review
        </button>
      </div>

      <div className="toolbar">
        <button
          className={`toolbar-btn ${editor?.isActive("bold") ? "active" : ""}`}
          onClick={() => toggleFormat("bold")}
          title="Bold"
          type="button"
        >
          <strong>B</strong>
        </button>

        <button
          className={`toolbar-btn ${editor?.isActive("italic") ? "active" : ""}`}
          onClick={() => toggleFormat("italic")}
          title="Italic"
          type="button"
        >
          <em>I</em>
        </button>
        <button
          className={`toolbar-btn ${editor?.isActive("underline") ? "active" : ""}`}
          onClick={() => toggleFormat("underline")}
          title="Underline"
          type="button"
        >
          <u>U</u>
        </button>
        <div className="case-dropdown-wrapper" ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
          <button
            className={`toolbar-btn ${showCaseMenu ? "active" : ""}`}
            onClick={() => setShowCaseMenu(!showCaseMenu)}
            title="Change case"
            type="button"
          >
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Aa</span>
          </button>

          {showCaseMenu && (
            <div className="case-dropdown-menu">
              <button onClick={() => applyCase('sentence')}>Sentence case</button>
              <button onClick={() => applyCase('lower')}>lower case</button>
              <button onClick={() => applyCase('upper')}>UPPER CASE</button>
              <button onClick={() => applyCase('capitalize')}>Capitalize Each Word</button>
            </div>
          )}
        </div>
        <div className="toolbar-divider"></div>
        <button
          className={`toolbar-btn ${editor?.isActive("bulletList") ? "active" : ""}`}
          onClick={() => toggleFormat("bullet")}
          title="Bullet list"
          type="button"
        >
          <img
            src="/src/assets/icons-bulleted-list.svg"
            alt="Bullet list"
            className="toolbar-icon"
          />
        </button>

        <button
          className={`toolbar-btn ${editor?.isActive("orderedList") ? "active" : ""}`}
          onClick={() => toggleFormat("ordered")}
          title="Number list"
          type="button"
        >
          <img
            src="/src/assets/better-number-list.svg"
            alt="Bullet list"
            className="toolbar-icon"
          />
        </button>
        <button
          className={`toolbar-btn ${editor?.isActive("blockquote") ? "active" : ""}`}
          onClick={() => toggleFormat("blockquote")}
          title="Quote"
          type="button"
        >
          ❝
        </button>
        <button
          className="toolbar-btn"
          title="Decrease Indent"
          type="button"
          onClick={() => editor?.commands.decreaseIndent()}
        >
          <img src="/src/assets/left-indent.svg" className="toolbar-icon" />
        </button>

        <button
          className="toolbar-btn"
          title="Increase Indent"
          type="button"
          onClick={() => editor?.commands.increaseIndent()}
        >
          <img src="/src/assets/right-indent.svg" className="toolbar-icon" />
        </button>

        <div className="toolbar-divider"></div>
        <button 
          className={`toolbar-btn ${editor?.isActive("link") ? "active" : ""}`}
          title="Link [ctrl+k]" 
          type="button"  
          onClick={() => setShowLinkModal(true)}
        >
          <img
            src="/src/assets/link-building.svg"
            alt="hyperlink"
            className="toolbar-icon"
          />
        </button>
      </div>

      <div className="editor-body">
        {proposedChanges ? (
          <div className="diff-viewer-container">
            <DiffViewer
              originalContent={editor?.getHTML() || ""}
              newContent={proposedChanges}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          </div>
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      <LinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onInsert={handleInsertLink}
        selectedText={getSelectedText()}
      />
    </div>
  );
};
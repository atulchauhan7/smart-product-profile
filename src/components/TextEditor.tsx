import { useState, FC, ChangeEvent, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { DiffViewer } from "./DiffViewer";
import "../styles/text-editor.css";

interface TextEditorProps {
  onCollapse: () => void;
  onContentChange?: (content: string) => void;
  onEditorReady?: (editor: any) => void;
  proposedChanges?: string | null;
  onAcceptChanges?: (newContent: string) => void;
  onRejectChanges?: () => void;
}

export const TextEditor: FC<TextEditorProps> = ({
  onCollapse,
  onContentChange,
  onEditorReady,
  proposedChanges,
  onAcceptChanges,
  onRejectChanges,
}) => {
  const [title, setTitle] = useState("Untitled Product");
  const [, forceUpdate] = useState(0);

  const initialContent = `<h2>1General Information</h2>
<p>Lorem ipsum is a dummy or placeholder text commonly used in graphic design, publishing, and web development. Its purpose is to permit a page layout to be designed, independently of the copy that will subsequently populate it, or to demonstrate various fonts of a typeface without meaningful text that could be distracting.</p>
 
<p>Lorem ipsum is typically a corrupted version of De finibus bonorum et malorum, a 1st-century BC text by the Roman statesman and philosopher Cicero, with words altered, added, and removed to make it nonsensical and improper Latin. The first two words are the truncation of dolorem ipsum ("pain itself").</p>
 
<h2>Data Information</h2>
<p>Versions of the Lorem ipsum text have been used in typesetting since the 1960s, when advertisements for Letraset transfer sheets popularized it. Lorem ipsum was introduced to the digital world in the mid-1980s, when Aldus employed it in graphic and word-processing templates for its desktop publishing program PageMaker.</p>
 
<h2>Legal Information</h2>
<p>Lorem dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
 
<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`;

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onSelectionUpdate: () => {
      forceUpdate((n) => n + 1);
    },
    onUpdate: ({ editor }) => {
      forceUpdate((n) => n + 1);
      if (onContentChange) {
        onContentChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: "editor-content",
      },
    },
  });

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
      if (onContentChange) {
        onContentChange(editor.getHTML());
      }
    }
  }, [editor, onEditorReady, onContentChange]);

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
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
          className="submit-review-btn"
          onClick={() => alert("Submit for review clicked")}
          title="Submit for review"
        >
          Submit for review
        </button>
        <button
          className="collapse-btn"
          onClick={onCollapse}
          title="Collapse editor"
        >
          ◀
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
        <button
          className={`toolbar-btn ${editor?.isActive("italic") ? "active" : ""}`}
          onClick={() => toggleFormat("italic")}
          title="Italic"
          type="button"
        >
          <h4>A</h4>
          <strong>
            <h5>A</h5>
          </strong>
        </button>
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
          className={`toolbar-btn`}
          onClick={() => toggleFormat("blockquote")}
          title="Quote"
          type="button"
        >
          <img
            src="/src/assets/left-indent.svg"
            alt="Bullet list"
            className="toolbar-icon"
          />
        </button>
        <button
          className={`toolbar-btn`}
          onClick={() => toggleFormat("blockquote")}
          title="Quote"
          type="button"
        >
          <img
            src="/src/assets/right-indent.svg"
            alt="Bullet list"
            className="toolbar-icon"
          />
        </button>
        <div className="toolbar-divider"></div>
        <button className="toolbar-btn" title="Link" type="button">
          <img
            src="/src/assets/link-building.svg"
            alt="Bullet list"
            className="toolbar-icon"
          />
        </button>

        <button className="toolbar-btn" title="Image" type="button">
          {" "}
          <img
            src="/src/assets/image.svg"
            alt="Bullet list"
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
              onAccept={() => onAcceptChanges?.(proposedChanges)}
              onReject={() => onRejectChanges?.()}
            />
          </div>
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </div>
  );
};

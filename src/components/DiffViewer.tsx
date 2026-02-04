import { FC } from "react";
import "../styles/diff-viewer.css";

export interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
  lineNumber?: number;
}

interface DiffViewerProps {
  originalContent: string;
  newContent: string;
  onAccept: () => void;
  onReject: () => void;
}

export const DiffViewer: FC<DiffViewerProps> = ({
  originalContent,
  newContent,
  onAccept,
  onReject,
}) => {
  const generateDiffLines = (): DiffLine[] => {
    const originalLines = originalContent.split("\n");
    const newLines = newContent.split("\n");
    const diffLines: DiffLine[] = [];

    let origIndex = 0;
    let newIndex = 0;

    while (origIndex < originalLines.length || newIndex < newLines.length) {
      if (origIndex < originalLines.length && newIndex < newLines.length) {
        if (originalLines[origIndex] === newLines[newIndex]) {
          diffLines.push({
            type: "context",
            content: originalLines[origIndex],
            lineNumber: origIndex + 1,
          });
          origIndex++;
          newIndex++;
        } else {
          // Find best match
          let foundMatch = false;
          for (let i = origIndex + 1; i < originalLines.length; i++) {
            if (originalLines[i] === newLines[newIndex]) {
              for (let j = origIndex; j < i; j++) {
                diffLines.push({
                  type: "remove",
                  content: originalLines[j],
                  lineNumber: j + 1,
                });
              }
              foundMatch = true;
              origIndex = i;
              break;
            }
          }
          if (!foundMatch) {
            diffLines.push({
              type: "remove",
              content: originalLines[origIndex],
              lineNumber: origIndex + 1,
            });
            origIndex++;
          }
        }
      } else if (origIndex < originalLines.length) {
        diffLines.push({
          type: "remove",
          content: originalLines[origIndex],
          lineNumber: origIndex + 1,
        });
        origIndex++;
      } else {
        diffLines.push({
          type: "add",
          content: newLines[newIndex],
        });
        newIndex++;
      }
    }

    return diffLines;
  };

  const diffLines = generateDiffLines();
  const addedCount = diffLines.filter((d) => d.type === "add").length;
  const removedCount = diffLines.filter((d) => d.type === "remove").length;

  return (
    <div className="diff-viewer">
      <div className="diff-header">
        <div className="diff-stats">
          <span className="diff-title">Changes Preview</span>
          <span className="diff-count added">+{addedCount} added</span>
          <span className="diff-count removed">-{removedCount} removed</span>
        </div>
        <div className="diff-actions">
          <button
            className="diff-btn reject-btn"
            onClick={onReject}
            title="Reject changes"
          >
            Reject
          </button>
          <button
            className="diff-btn accept-btn"
            onClick={onAccept}
            title="Accept changes"
          >
            Accept
          </button>
        </div>
      </div>

      <div className="diff-content">
        {diffLines.map((line, index) => (
          <div key={index} className={`diff-line diff-line-${line.type}`}>
            <div className="diff-line-number">
              {line.type === "context" && (
                <span className="line-num">{line.lineNumber}</span>
              )}
              {line.type === "remove" && (
                <span className="line-num removed">{line.lineNumber}</span>
              )}
              {line.type === "add" && <span className="line-num">+</span>}
            </div>
            <div className="diff-line-prefix">
              {line.type === "add" && <span className="prefix add">+</span>}
              {line.type === "remove" && (
                <span className="prefix remove">-</span>
              )}
              {line.type === "context" && (
                <span className="prefix context"> </span>
              )}
            </div>
            <div className="diff-line-content">
              <div dangerouslySetInnerHTML={{ __html: line.content || " " }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
    // Normalize HTML by adding newlines after closing tags
    const normalizeHTML = (html: string): string => {
      return html
        .replace(/></g, '>\n<')  // Add newline between > and <
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
    };
    
    const normalizedOriginal = normalizeHTML(originalContent);
    const normalizedNew = normalizeHTML(newContent);
    
    const originalLines = normalizedOriginal.split("\n");
    const newLines = normalizedNew.split("\n");
    const diffLines: DiffLine[] = [];
    
    // Log for debugging
    console.log('=== DIFF VIEWER DEBUG ===');
    console.log('Original lines count:', originalLines.length);
    console.log('New lines count:', newLines.length);
    console.log('First orig line:', JSON.stringify(originalLines[0]));
    console.log('First new line:', JSON.stringify(newLines[0]));
    
    // Create a simple diff using line matching
    const matched: boolean[] = new Array(newLines.length).fill(false);
    const diffResult: Array<{type: "add" | "remove" | "context", orig?: number, new?: number}> = [];
    
    // First pass: find matching lines
    for (let i = 0; i < originalLines.length; i++) {
      let found = false;
      for (let j = 0; j < newLines.length; j++) {
        if (!matched[j] && originalLines[i] === newLines[j]) {
          // Found a match
          matched[j] = true;
          diffResult.push({type: "context", orig: i, new: j});
          found = true;
          break;
        }
      }
      if (!found) {
        // Line was removed
        diffResult.push({type: "remove", orig: i});
      }
    }
    
    // Second pass: find lines that were added
    for (let j = 0; j < newLines.length; j++) {
      if (!matched[j]) {
        diffResult.push({type: "add", new: j});
      }
    }
    
    console.log('Diff result before sorting:', diffResult.length, 'items');
    console.log('Added count:', diffResult.filter(d => d.type === 'add').length);
    console.log('Removed count:', diffResult.filter(d => d.type === 'remove').length);
    console.log('Context count:', diffResult.filter(d => d.type === 'context').length);
    
    // Sort by position to maintain order
    diffResult.sort((a, b) => {
      const aPos = a.orig !== undefined ? a.orig : (a.new !== undefined ? a.new + originalLines.length : 0);
      const bPos = b.orig !== undefined ? b.orig : (b.new !== undefined ? b.new + originalLines.length : 0);
      return aPos - bPos;
    });
    
    // Build diff lines
    for (const item of diffResult) {
      if (item.type === "context" && item.orig !== undefined && item.new !== undefined) {
        diffLines.push({
          type: "context",
          content: originalLines[item.orig],
          lineNumber: item.orig + 1,
        });
      } else if (item.type === "remove" && item.orig !== undefined) {
        diffLines.push({
          type: "remove",
          content: originalLines[item.orig],
          lineNumber: item.orig + 1,
        });
      } else if (item.type === "add" && item.new !== undefined) {
        diffLines.push({
          type: "add",
          content: newLines[item.new],
        });
      }
    }
    
    // Find all change indices
    const changeIndices: number[] = [];
    diffLines.forEach((line, idx) => {
      if (line.type !== "context") {
        changeIndices.push(idx);
      }
    });
    
    if (changeIndices.length === 0) {
      return [{
        type: "context",
        content: "No changes detected",
        lineNumber: 0,
      }];
    }
    
    // Group changes into hunks with context
    const CONTEXT_LINES = 3;
    const hunks: Array<{ start: number; end: number }> = [];
    let hunkStart = changeIndices[0];
    let hunkEnd = changeIndices[0];
    
    for (let i = 1; i < changeIndices.length; i++) {
      if (changeIndices[i] - hunkEnd <= CONTEXT_LINES * 2 + 1) {
        hunkEnd = changeIndices[i];
      } else {
        hunks.push({ start: hunkStart, end: hunkEnd });
        hunkStart = changeIndices[i];
        hunkEnd = changeIndices[i];
      }
    }
    hunks.push({ start: hunkStart, end: hunkEnd });
    
    // Build final output with context
    const finalLines: DiffLine[] = [];
    hunks.forEach((hunk, hunkIndex) => {
      const contextStart = Math.max(0, hunk.start - CONTEXT_LINES);
      const contextEnd = Math.min(diffLines.length - 1, hunk.end + CONTEXT_LINES);
      
      // Add separator between hunks
      if (hunkIndex > 0) {
        finalLines.push({
          type: "context",
          content: "...",
        });
      }
      
      // Add lines with context
      for (let i = contextStart; i <= contextEnd; i++) {
        finalLines.push(diffLines[i]);
      }
    });
    
    return finalLines;
  };

  const diffLines = generateDiffLines();
  const addedCount = diffLines.filter((d) => d.type === "add").length;
  const removedCount = diffLines.filter((d) => d.type === "remove").length;

  // Group consecutive remove/add lines for paired display
  const renderDiffLines = () => {
    const rendered: JSX.Element[] = [];
    let i = 0;

    while (i < diffLines.length) {
      const line = diffLines[i];

      if (line.type === "context") {
        // Render context line as-is
        rendered.push(
          <div key={i} className="diff-line diff-line-context">
            <div className="diff-line-number">
              <span className="line-num">{line.lineNumber}</span>
            </div>
            <div className="diff-line-prefix">
              <span className="prefix context"> </span>
            </div>
            <div className="diff-line-content">
              <div dangerouslySetInnerHTML={{ __html: line.content || " " }} />
            </div>
          </div>
        );
        i++;
      } else if (line.type === "remove") {
        // Check if next line is an add (paired change)
        const nextLine = i + 1 < diffLines.length ? diffLines[i + 1] : null;
        const isPaired = nextLine && nextLine.type === "add";

        if (isPaired) {
          // Render paired remove/add together
          rendered.push(
            <div key={i} className="diff-change-pair">
              <div className="diff-line diff-removed">
                <div className="diff-line-number">
                  <span className="line-num removed">{line.lineNumber}</span>
                </div>
                <div className="diff-line-prefix">
                  <span className="prefix remove">−</span>
                </div>
                <div className="diff-line-content">
                  <div dangerouslySetInnerHTML={{ __html: line.content || " " }} />
                </div>
              </div>
              <div className="diff-line diff-added">
                <div className="diff-line-number">
                  <span className="line-num">+</span>
                </div>
                <div className="diff-line-prefix">
                  <span className="prefix add">+</span>
                </div>
                <div className="diff-line-content">
                  <div dangerouslySetInnerHTML={{ __html: nextLine!.content || " " }} />
                </div>
              </div>
            </div>
          );
          i += 2; // Skip both remove and add
        } else {
          // Render unpaired remove
          rendered.push(
            <div key={i} className="diff-line diff-removed">
              <div className="diff-line-number">
                <span className="line-num removed">{line.lineNumber}</span>
              </div>
              <div className="diff-line-prefix">
                <span className="prefix remove">−</span>
              </div>
              <div className="diff-line-content">
                <div dangerouslySetInnerHTML={{ __html: line.content || " " }} />
              </div>
            </div>
          );
          i++;
        }
      } else if (line.type === "add") {
        // Unpaired add (shouldn't happen if diff is correct, but handle it)
        rendered.push(
          <div key={i} className="diff-line diff-added">
            <div className="diff-line-number">
              <span className="line-num">+</span>
            </div>
            <div className="diff-line-prefix">
              <span className="prefix add">+</span>
            </div>
            <div className="diff-line-content">
              <div dangerouslySetInnerHTML={{ __html: line.content || " " }} />
            </div>
          </div>
        );
        i++;
      }
    }

    return rendered;
  };

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
        {renderDiffLines()}
      </div>
    </div>
  );
};

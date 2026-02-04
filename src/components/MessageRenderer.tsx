import { FC, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ImagePreviewModal } from './ImagePreviewModal';

interface MessageChange {
  old_msg: string;
  new_msg: string;
}

interface MessageImage {
  url: string;
  alt?: string;
}

interface MessageData {
  type: 'text' | 'change' | 'image';
  content?: string;
  change?: MessageChange;
  image?: MessageImage;
}

interface MessageRendererProps {
  content: string;
}

export const MessageRenderer: FC<MessageRendererProps> = ({ content }) => {
  const [previewImage, setPreviewImage] = useState<{ url: string; alt: string } | null>(null);

  // Try to parse as JSON first
  const parseMessageData = (text: string): MessageData | null => {
    try {
      // Trim whitespace and check if it looks like JSON
      const trimmed = text.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object' && parsed.type) {
          return parsed as MessageData;
        }
      }
    } catch (error) {
      console.log('JSON parse error:', error);
      return null;
    }
    return null;
  };

  const messageData = parseMessageData(content);
  console.log('Content:', content);
  console.log('Parsed messageData:', messageData);

  // Handle JSON response format
  if (messageData) {
    switch (messageData.type) {
      case 'text':
        return (
          <div className="message-text">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {messageData.content || ''}
            </ReactMarkdown>
          </div>
        );

      case 'change':
        return (
          <div className="message-change">
            <div className="change-section old-message">
              <div className="change-label">Old Message:</div>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {messageData.change?.old_msg || ''}
              </ReactMarkdown>
            </div>
            <div className="change-divider">→</div>
            <div className="change-section new-message">
              <div className="change-label">New Message:</div>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {messageData.change?.new_msg || ''}
              </ReactMarkdown>
            </div>
          </div>
        );

      case 'image':
        // Handle both external URLs and local file paths
        const imageSrc = messageData.image?.url || '';
        const resolvedSrc = imageSrc.startsWith('http') 
          ? imageSrc 
          : imageSrc.startsWith('/src/') 
            ? imageSrc 
            : `/src/assets/${imageSrc}`;
        
        return (
            <>
            <div 
              className="message-image" 
              onClick={() => setPreviewImage({ 
                url: resolvedSrc, 
                alt: messageData.image?.alt || 'AI generated image' 
              })}
              style={{ cursor: 'pointer' }}
              title="Click to view full size"
            >
              <img
                src={resolvedSrc}
                alt={messageData.image?.alt || 'AI generated image'}
                onError={(e) => {
                  console.error('Image failed to load:', resolvedSrc);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', resolvedSrc);
                }}
              />
            </div>
            {previewImage && (
              <ImagePreviewModal
                imageUrl={previewImage.url}
                imageAlt={previewImage.alt}
                onClose={() => setPreviewImage(null)}
              />
            )}
          </>
        );

      default:
        return (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        );
    }
  }

  // Default: render as markdown
  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={{
        // Custom styles for markdown elements
        h1: ({node, ...props}) => <h1 style={{fontSize: '1.5em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
        h2: ({node, ...props}) => <h2 style={{fontSize: '1.3em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
        h3: ({node, ...props}) => <h3 style={{fontSize: '1.1em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
        p: ({node, ...props}) => <p style={{marginTop: '0.5em', marginBottom: '0.5em', lineHeight: '1.6'}} {...props} />,
        ul: ({node, ...props}) => <ul style={{marginLeft: '1.5em', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
        ol: ({node, ...props}) => <ol style={{marginLeft: '1.5em', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
        li: ({node, ...props}) => <li style={{marginTop: '0.25em', marginBottom: '0.25em'}} {...props} />,
        code: ({node, ...props}) => {
          const isInline = !String(props.className || '').includes('language-');
          return isInline 
            ? <code style={{backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '0.9em'}} {...props} />
            : <code style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.05)', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.9em', overflowX: 'auto', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />;
        },
        blockquote: ({node, ...props}) => <blockquote style={{borderLeft: '4px solid #d32f2f', paddingLeft: '1em', marginLeft: '0', color: '#666', fontStyle: 'italic'}} {...props} />,
        a: ({node, ...props}) => <a style={{color: '#d32f2f', textDecoration: 'underline'}} target="_blank" rel="noopener noreferrer" {...props} />,
        strong: ({node, ...props}) => <strong style={{fontWeight: '600'}} {...props} />,
        em: ({node, ...props}) => <em style={{fontStyle: 'italic'}} {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

import { useState, FC, KeyboardEvent, useRef, useEffect } from 'react';
import '../styles/ai-agent.css';
import { ChatMessage } from '../types';

interface AIAgentProps {
  onCollapse: () => void;
}

export const AIAgent: FC<AIAgentProps> = ({ onCollapse }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "I've written a paragraph about Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: '2',
      role: 'user',
      content: 'Will third parties be accessing this tool?',
      timestamp: new Date(Date.now() - 120000)
    },
    {
      id: '3',
      role: 'assistant',
      content: 'No. This tool will only be for Lilly employees and use their existing Lilly accounts to log in.',
      timestamp: new Date(Date.now() - 60000)
    },
    {
      id: '4',
      role: 'user',
      content: "I've written a paragraph about Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      timestamp: new Date()
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [confidenceScore] = useState(70);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Dummy AI responses - Replace this function with actual API call
  const generateDummyResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Dummy response library - Easy to replace with API call
    const dummyResponses: { [key: string]: string } = {
      'improve': 'Great question! Here are some suggestions to improve your product description:\n\n1. Add specific benefits and use cases\n2. Include quantifiable metrics or data\n3. Highlight what makes your product unique\n4. Use clear, concise language\n5. Consider adding customer testimonials\n\nWould you like me to expand on any of these suggestions?',
      
      'feature': 'Your product description should clearly highlight:\n\n• Core features and functionality\n• Key benefits for the user\n• Target audience\n• Pricing or value proposition\n• How it solves customer problems\n\nMake sure each feature is explained in terms of user benefits!',
      
      'tone': 'Based on your current content, I\'d recommend:\n\n• Use a professional yet approachable tone\n• Avoid overly technical jargon for general audiences\n• Use active voice (e.g., "Transform your workflow" instead of "Your workflow will be transformed")\n• Be specific about benefits rather than vague claims\n\nThis will make your product more appealing to potential customers.',
      
      'grammar': 'Your content looks good from a grammar perspective! A few tips:\n\n• Keep sentences concise (15-20 words)\n• Use short paragraphs (2-3 sentences)\n• Break up longer sections with bullet points\n• Ensure consistent tense throughout\n• Proofread for typos and formatting\n\nConsistency and clarity are key!',
      
      'default': 'That\'s an excellent point! Here\'s my feedback:\n\nYour product description has a solid foundation. To make it even better:\n\n1. **Be More Specific** - Add concrete examples and use cases\n2. **Highlight Unique Value** - What sets this product apart?\n3. **Focus on Benefits** - How does this solve customer problems?\n4. **Improve Clarity** - Simplify complex concepts\n5. **Add Social Proof** - Include customer testimonials or case studies\n\nWould you like me to suggest changes for any specific section?'
    };

    // Check which keyword matches the user input
    for (const [keyword, response] of Object.entries(dummyResponses)) {
      if (keyword !== 'default' && lowerMessage.includes(keyword)) {
        return response;
      }
    }

    // Return default response if no keyword matches
    return dummyResponses.default;
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: inputValue,
        timestamp: new Date()
      };

      setMessages([...messages, newMessage]);
      const userInput = inputValue;
      setInputValue('');

      // Simulate AI response with delay
      setTimeout(() => {
        const dummyResponse = generateDummyResponse(userInput);
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: dummyResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 800);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="ai-agent">
      <div className="ai-header">
        <span className="ai-title">Planning Assistant</span>
        <button className="collapse-btn" onClick={onCollapse} title="Collapse AI panel">
          ▶
        </button>
      </div>

      <div className="confidence-section">
        <div className="confidence-label">
          <span>Confidence score</span>
          <span className="info-icon">ℹ️</span>
        </div>
        <div className="confidence-display">
          <span className="score-number">{confidenceScore}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${confidenceScore}%` }}></div>
        </div>
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-content">{message.content}</div>
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-section">
        <div className="input-hint">How can I help?</div>
        <div className="input-wrapper">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
            className="chat-input"
            rows={1}
          />
          <button 
            className="send-btn" 
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            title="Send message"
          >
            ↑
          </button>
        </div>
        <div className="ai-disclaimer">AI-generated responses may contain errors. Always verify accuracy.</div>
      </div>
    </div>
  );
};

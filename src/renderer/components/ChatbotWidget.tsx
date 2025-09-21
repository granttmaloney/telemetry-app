import React from 'react';
import { HiOutlineX } from 'react-icons/hi';

interface ChatbotWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ isOpen, onClose, onOpen }) => {
  if (!isOpen) {
    return (
      <button
        type="button"
        className="chatbot-fab"
        onClick={onOpen}
        aria-label="Open chat assistant"
      >
        Assistant
      </button>
    );
  }

  return (
    <aside className="chatbot-widget" role="complementary" aria-label="Telemetry assistant">
      <header className="chatbot-header">
        <span className="chatbot-title">Telemetry Assistant</span>
        <button
          type="button"
          className="chatbot-close"
          onClick={onClose}
          aria-label="Close chat assistant"
        >
          <HiOutlineX size={14} />
        </button>
      </header>
      <div className="chatbot-body">
        <p>
          The assistant will live here. For now it simply opens and closes from the settings menu.
        </p>
      </div>
    </aside>
  );
};

export default ChatbotWidget;

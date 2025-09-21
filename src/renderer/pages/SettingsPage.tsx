import React from 'react';

interface SettingsPageProps {
  onOpenChatbot: () => void;
  isChatbotOpen: boolean;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenChatbot, isChatbotOpen }) => {
  return (
    <section className="content-section">
      <h2>Application Settings</h2>
      <p className="muted">
        Manage application preferences, integrations, and workspace defaults.
      </p>
      <div className="card settings-card">
        <h3>Assistant Widget</h3>
        <p className="muted">
          Open the floating assistant if you closed it from the main UI.
        </p>
        <button
          type="button"
          className="chatbot-open"
          onClick={onOpenChatbot}
          disabled={isChatbotOpen}
        >
          {isChatbotOpen ? 'Assistant is active' : 'Reopen assistant'}
        </button>
      </div>
    </section>
  );
};

export default SettingsPage;

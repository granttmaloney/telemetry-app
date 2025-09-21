import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ChannelSetupPage from './pages/ChannelSetupPage';
import SetupPage from './pages/SetupPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import PlotPage from './pages/PlotPage';
import Sidebar, { SidebarItem } from './components/Sidebar';
import ChatbotWidget from './components/ChatbotWidget';
import {
  HiOutlineHome,
  HiOutlineClipboardCheck,
  HiOutlineChartSquareBar,
  HiOutlineBell,
  HiOutlineDocumentReport,
  HiOutlineCog,
  HiOutlineAdjustments
} from 'react-icons/hi';

const NAV_ITEMS: SidebarItem[] = [
  { path: '/', label: 'Home', icon: <HiOutlineHome /> },
  { path: '/channels', label: 'Channel Setup', icon: <HiOutlineAdjustments /> },
  { path: '/setup', label: 'Setup', icon: <HiOutlineClipboardCheck /> },
  { path: '/analytics', label: 'Analytics', icon: <HiOutlineChartSquareBar /> },
  { path: '/alerts', label: 'Alerts', icon: <HiOutlineBell /> },
  { path: '/reports', label: 'Reports', icon: <HiOutlineDocumentReport /> },
  { path: '/settings', label: 'Settings', icon: <HiOutlineCog /> }
];

const App: React.FC = () => {
  const location = useLocation();
  const isPlotRoute = location.pathname.startsWith('/plot');
  const [isChatbotOpen, setIsChatbotOpen] = React.useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(false);
  const handleSidebarExpand = React.useCallback(() => setIsSidebarExpanded(true), []);
  const handleSidebarCollapse = React.useCallback(() => setIsSidebarExpanded(false), []);

  const contentClassName = `app-content${isPlotRoute ? ' app-content--plot' : ''}`;

  return (
    <div className={`app-shell${isPlotRoute ? ' app-shell--plot' : ''}`}>
      {!isPlotRoute && (
        <header className="app-header">
          <h1>Telemetry Monitor</h1>
          <div className="header-actions">
            <button onClick={() => window.electronAPI?.createPlotWindow?.({})}>
              New Plot Window
            </button>
          </div>
        </header>
      )}
      <div className={`app-body${isPlotRoute ? ' app-body--plot' : ''}`}>
        {!isPlotRoute && (
          <Sidebar
            items={NAV_ITEMS}
            expanded={isSidebarExpanded}
            onExpand={handleSidebarExpand}
            onCollapse={handleSidebarCollapse}
          />
        )}
        <main className={contentClassName}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/channels" element={<ChannelSetupPage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route
              path="/settings"
              element={
                <SettingsPage
                  onOpenChatbot={() => setIsChatbotOpen(true)}
                  isChatbotOpen={isChatbotOpen}
                />
              }
            />
            <Route path="/plot/:plotId" element={<PlotPage />} />
          </Routes>
        </main>
      </div>
      <ChatbotWidget
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onOpen={() => setIsChatbotOpen(true)}
      />
    </div>
  );
};

export default App;

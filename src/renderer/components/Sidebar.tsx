import React from 'react';
import { NavLink } from 'react-router-dom';
import { HiChevronLeft } from 'react-icons/hi';

export interface SidebarItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items, expanded, onExpand, onCollapse }) => {
  const hoverLockRef = React.useRef(false);

  const handleExpand = () => {
    if (hoverLockRef.current) {
      return;
    }
    onExpand();
  };

  const handleMouseLeave = () => {
    hoverLockRef.current = false;
    onCollapse();
  };

  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      hoverLockRef.current = false;
      onCollapse();
    }
  };

  const handleManualCollapse = () => {
    hoverLockRef.current = true;
    onCollapse();
  };

  return (
    <aside
      className={`sidebar${expanded ? ' sidebar--expanded' : ''}`}
      role="navigation"
      aria-label="Primary navigation"
      onMouseEnter={handleExpand}
      onMouseLeave={handleMouseLeave}
      onFocusCapture={handleExpand}
      onBlurCapture={handleBlur}
    >
      {expanded && (
        <button
          type="button"
          className="sidebar-collapse"
          onClick={handleManualCollapse}
          aria-label="Collapse navigation"
        >
          <HiChevronLeft size={18} />
        </button>
      )}
      <ul className="sidebar-list">
        {items.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
              }
            >
              <span className="sidebar-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;

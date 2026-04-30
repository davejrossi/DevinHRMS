import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '⊞' },
  { to: '/employees', label: 'Employees', icon: '⊟' },
  { to: '/departments', label: 'Departments', icon: '⊠' },
  { to: '/positions', label: 'Positions', icon: '⊡' },
  { to: '/org-chart', label: 'Org Chart', icon: '⋈' },
  { to: '/analytics', label: 'Analytics', icon: '⊕' },
  { to: '/career-planning', label: 'Career Plan', icon: '⊜' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <header className="topbar">
        <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
        <div className="topbar-brand">
          <h1>HRMS</h1>
          <span className="topbar-subtitle">Human Resource Management</span>
        </div>
      </header>
      <div className="layout-body">
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

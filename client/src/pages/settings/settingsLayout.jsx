import { NavLink, Outlet } from "react-router-dom";
import "./settingsLayout.css";

export default function SettingsLayout() {
  return (
    <div className="settings-page">
      {/* SETTINGS SIDEBAR */}
      <aside className="sidebar settings-sidebar">
        <h3>Settings</h3>
        <nav>
          <NavLink to="profile" end className="settings-link">
            Profile
          </NavLink>
          <NavLink to="preferences" end className="settings-link">
            Preferences
          </NavLink>
          <NavLink to="help" end className="settings-link">
            Help
          </NavLink>
          <NavLink to="about" end className="settings-link">
            About
          </NavLink>
        </nav>
      </aside>

      {/* SETTINGS CONTENT */}
      <main className="settings-content">
        <Outlet />
      </main>
    </div>
  );
}

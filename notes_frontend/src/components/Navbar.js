import React from "react";

// PUBLIC_INTERFACE
/**
 * Navbar - top-level navigation bar for branding and auth links.
 * @param {object} props - {user, onLogout}
 */
function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar" style={{ background: "var(--primary)", color: "#fff" }}>
      <div className="navbar__brand">
        <span role="img" aria-label="notes" style={{ fontSize: 24, marginRight: 8 }}>📝</span>
        <span className="navbar__title">UniNotes</span>
      </div>
      <div className="navbar__links">
        {user ? (
          <>
            <span style={{ marginRight: 12, fontSize: 14 }}>Hello, <b>{user.user.username}</b></span>
            <button className="btn btn-accent" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            {/* Normally would include login/signup, but AuthPage handles switching */}
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

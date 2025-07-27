import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import NotesPage from "./pages/NotesPage";
import AuthPage from "./pages/AuthPage";
import { getUserFromLocalStorage } from "./utils/auth";
import "./App.css";

const apiBase = "https://vscode-internal-6102-beta.beta01.cloud.kavia.ai:3001";
// All API requests use apiBase as the backend base URL

function AppContainer() {
  const [user, setUser] = useState(getUserFromLocalStorage());
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);

  useEffect(() => {
    function handleResize() {
      setSidebarOpen(window.innerWidth > 900);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Logout clears state
  function handleLogout() {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  if (!user) {
    return (
      <div data-theme="light" style={{ minHeight: "100vh", background: 'var(--bg-primary)' }}>
        <Navbar user={null} onLogout={handleLogout} />
        <AuthPage setUser={setUser} apiBase={apiBase} />
      </div>
    );
  }

  return (
    <div data-theme="light" style={{ minHeight: "100vh", background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="main-layout">
        <Sidebar 
          open={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
          apiBase={apiBase} 
          token={user.token} 
        />
        <main className="content-area" tabIndex={-1}>
          <NotesPage apiBase={apiBase} user={user} />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AppContainer />} />
        <Route path="*" element={<AppContainer />} />
      </Routes>
    </Router>
  );
}

export default App;

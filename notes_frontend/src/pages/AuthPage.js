import React, { useState } from "react";
import { saveUserToLocalStorage } from "../utils/auth";

// PUBLIC_INTERFACE
/**
 * AuthPage - shows Login/Signup forms and handles authentication.
 * @param {object} props - { setUser, apiBase }
 */
function AuthPage({ setUser, apiBase }) {
  const [isSignup, setIsSignup] = useState(false);
  const [fields, setFields] = useState({ username: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFields({ ...fields, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!fields.username || !fields.password || (isSignup && !fields.confirm)) {
      setLoading(false);
      setError("Fill in all fields.");
      return;
    }
    if (isSignup && fields.password !== fields.confirm) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }

    fetch(`${apiBase}/auth/${isSignup ? "signup" : "login"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: fields.username, password: fields.password })
    })
      .then(async res => {
        if (res.ok) return res.json();
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Authentication failed");
      })
      .then(data => {
        // Data: { user, token }
        saveUserToLocalStorage(data);
        setUser(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  function switchMode() {
    setError("");
    setIsSignup(s => !s);
    setFields({ username: "", password: "", confirm: "" });
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
        <h2 style={{ color: "var(--primary)", marginBottom: 18 }}>
          {isSignup ? "Sign Up" : "Login"}
        </h2>
        <label>
          Username
          <input
            name="username"
            className="auth-input"
            value={fields.username}
            onChange={handleChange}
            required
            autoFocus
          />
        </label>
        <label>
          Password
          <input
            name="password"
            className="auth-input"
            type="password"
            value={fields.password}
            onChange={handleChange}
            required
          />
        </label>
        {isSignup && (
          <label>
            Confirm Password
            <input
              name="confirm"
              className="auth-input"
              type="password"
              value={fields.confirm}
              onChange={handleChange}
              required
            />
          </label>
        )}
        {error && <div className="alert auth-error">{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
        </button>
        <div style={{ marginTop: 14 }}>
          {isSignup
            ? (
              <span>
                Already have an account?{" "}
                <button className="link-btn" type="button" onClick={switchMode}>Sign in</button>
              </span>
            ) : (
              <span>
                No account?{" "}
                <button className="link-btn" type="button" onClick={switchMode}>Sign up</button>
              </span>
            )}
        </div>
      </form>
    </div>
  );
}

export default AuthPage;

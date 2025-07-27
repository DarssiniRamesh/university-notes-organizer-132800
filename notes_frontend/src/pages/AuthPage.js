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

    if (isSignup) {
      // Signup via /auth/signup, expects JSON username/password
      fetch(`${apiBase}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: fields.username, password: fields.password })
      })
        .then(async res => {
          // success returns JSON with id/username/created_at, otherwise HTTP 4xx
          if (res.ok) return res.json();
          const d = await res.json().catch(() => ({}));
          throw new Error(d.detail || "Signup failed");
        })
        .then(user => {
          // Signup is successful, but per FastAPI docs, need to prompt login
          setError("Signup successful! Please log in.");
          setIsSignup(false);
          setFields({ username: fields.username, password: "", confirm: "" });
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      // Login via /auth/token, expects form-encoded (not JSON)
      const formBody = new URLSearchParams({
        username: fields.username,
        password: fields.password
      });
      fetch(`${apiBase}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody.toString()
      })
        .then(async res => {
          if (res.ok) return res.json();
          const d = await res.json().catch(() => ({}));
          throw new Error(d.detail || "Login failed");
        })
        .then(tokenData => {
          // Token { access_token, token_type }
          // Immediately get user info via /auth/me (token required)
          fetch(`${apiBase}/auth/me`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`
            }
          })
            .then(res2 => res2.ok ? res2.json() : Promise.reject("User info error"))
            .then(userObj => {
              // Structure must match { user, token }
              const combo = { user: userObj, token: tokenData.access_token };
              saveUserToLocalStorage(combo);
              setUser(combo);
            })
            .catch(err => setError(typeof err === "string" ? err : "User info error"));
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }

  function switchMode() {
    setError("");
    setIsSignup(s => !s);
    setFields({ username: "", password: "", confirm: "" });
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
        <h2>
          {isSignup ? "Sign Up" : "Login"}
        </h2>
        <div className="auth-field-group">
          <label htmlFor="auth-username">
            Username
          </label>
          <input
            id="auth-username"
            name="username"
            className="auth-input"
            value={fields.username}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>
        <div className="auth-field-group">
          <label htmlFor="auth-password">
            Password
          </label>
          <input
            id="auth-password"
            name="password"
            className="auth-input"
            type="password"
            value={fields.password}
            onChange={handleChange}
            required
          />
        </div>
        {isSignup && (
          <div className="auth-field-group">
            <label htmlFor="auth-confirm">
              Confirm Password
            </label>
            <input
              id="auth-confirm"
              name="confirm"
              className="auth-input"
              type="password"
              value={fields.confirm}
              onChange={handleChange}
              required
            />
          </div>
        )}
        {error && <div className="alert auth-error">{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
        </button>
        <div style={{ marginTop: 13, textAlign: "center" }}>
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

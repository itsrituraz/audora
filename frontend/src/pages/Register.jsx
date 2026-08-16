import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="sub">Listener or artist — pick your role.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="chip-select">
            <div
              className={`chip-option${form.role === "user" ? " selected" : ""}`}
              onClick={() => setForm((f) => ({ ...f, role: "user" }))}
            >
              Listener
            </div>
            <div
              className={`chip-option${form.role === "artist" ? " selected" : ""}`}
              onClick={() => setForm((f) => ({ ...f, role: "artist" }))}
            >
              Artist
            </div>
          </div>

          <div className="field">
            <label>Username</label>
            <input type="text" value={form.username} onChange={update("username")} required autoFocus />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={update("email")} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={update("password")} required minLength={6} />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <div className="switch-line">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}

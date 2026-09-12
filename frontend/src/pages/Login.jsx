import { saveTokens } from "../services/auth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
/* ---------------------------------------------------------
   NeuroSync — Login
   Styled to match Landing.jsx and Register.jsx
--------------------------------------------------------- */

const displayFont = { fontFamily: "'Space Grotesk', sans-serif" };

function IconMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <circle cx="16" cy="16" r="13" stroke="#34d399" strokeWidth="1.6" fill="none" />
      <path
        d="M7 16h4l2-6 4 12 2-8 1.5 2H25"
        stroke="#a78bfa"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder-slate-600 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20";
const labelClass = "mb-2 block text-sm font-medium text-slate-300";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();


  useEffect(() => {
    if (!document.head.querySelector("[data-neurosync-fonts]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap";
      link.setAttribute("data-neurosync-fonts", "true");
      document.head.appendChild(link);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:8000/api/users/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        saveTokens(data.access, data.refresh);
        navigate('/dashboard')
      } else {
        console.log("Login failed:", data);
        alert(data.error || "Invalid username or password");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Is the Django server running?");
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100 antialiased"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      <div className="w-full max-w-lg">
        <a href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <IconMark className="h-8 w-8" />
          <span style={displayFont} className="text-lg font-semibold tracking-tight">
            NeuroSync
          </span>
        </a>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 sm:p-10">
          <h1 style={displayFont} className="text-3xl font-semibold tracking-tight text-slate-100">
            Welcome back
          </h1>
          <p className="mt-2 text-slate-400">Sign in to see where your signals are at.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className={labelClass}>Username</label>
              <input
                type="text"
                name="username"
                placeholder="your username..."
                value={formData.username}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className={labelClass}>Password</label>
                <a href="/forgot-password" className="mb-2 text-xs font-medium text-emerald-400 hover:text-emerald-300">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-emerald-400 py-3.5 font-medium text-slate-950 transition-colors hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Sign in
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <a href="/register" className="font-medium text-emerald-400 transition-colors hover:text-emerald-300">
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
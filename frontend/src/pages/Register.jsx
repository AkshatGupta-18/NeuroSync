import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ---------------------------------------------------------
   NeuroSync — Register
   Same fields/logic as before, restyled to match Landing.jsx
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

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:8000/api/users/register/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("Registration successful:", data);
      alert("Account created successfully!");
      navigate('/register-success');
    } else {
      console.log("Registration failed:", data);
      alert("Registration failed");
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
            Create your account
          </h1>
          <p className="mt-2 text-slate-400">
            Set up your profile so NeuroSync knows what to look for.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className={labelClass}>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Password</label>
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

              <div>
                <label className={labelClass}>Confirm password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-emerald-400 py-3.5 font-medium text-slate-950 transition-colors hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Create account
            </button>

            <p className="text-center text-xs text-slate-500">
              Encrypted by default. You choose what to share, later.
            </p>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-emerald-400 transition-colors hover:text-emerald-300">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
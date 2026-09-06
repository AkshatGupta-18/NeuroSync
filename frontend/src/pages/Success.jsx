import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const displayFont = {
  fontFamily: "'Space Grotesk', sans-serif",
};

function IconMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <circle
        cx="16"
        cy="16"
        r="13"
        stroke="#34d399"
        strokeWidth="1.6"
        fill="none"
      />
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

function Success() {
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

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100 antialiased"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <IconMark className="h-8 w-8" />

          <span
            style={displayFont}
            className="text-lg font-semibold tracking-tight"
          >
            NeuroSync
          </span>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 text-center sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
            <svg
              viewBox="0 0 24 24"
              className="h-10 w-10 text-emerald-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <h1
            style={displayFont}
            className="mt-7 text-3xl font-semibold tracking-tight text-slate-100"
          >
            Account created successfully
          </h1>

          <p className="mt-3 leading-relaxed text-slate-400">
            Your NeuroSync account is ready. Sign in to continue and start
            exploring your personalized experience.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-8 w-full rounded-full bg-emerald-400 py-3.5 font-medium text-slate-950 transition-colors hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Continue to Login
          </button>

          <button
            onClick={() => navigate("/")}
            className="mt-4 text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Success;
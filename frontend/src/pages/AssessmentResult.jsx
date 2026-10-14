import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import { clearTokens } from "../services/auth";

const displayFont = {
  fontFamily: "'Space Grotesk', sans-serif",
};

const monoFont = {
  fontFamily: "'IBM Plex Mono', monospace",
};

const getScoreWidth = (score) => {
  if (typeof score !== "number") {
    return "0%";
  }

  return `${Math.min(100, Math.max(0, score))}%`;
};

function AssessmentResult() {
  const navigate = useNavigate();
  const { assessmentId } = useParams();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchResult = async () => {
      if (!assessmentId) {
        if (isMounted) {
          setError("This assessment result could not be identified.");
          setLoading(false);
        }
        return;
      }

      try {
        const response = await apiRequest(
          `/assessments/${assessmentId}/interpretation/`,
          {
            method: "GET",
          }
        );

        if (response.status === 401) {
          clearTokens();
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          let message = "We couldn't load your assessment results.";

          try {
            const data = await response.json();

            if (data.detail) {
              message = data.detail;
            }
          } catch {
            // Keep the generic message when the response is not JSON.
          }

          if (isMounted) {
            setError(message);
          }

          return;
        }

        const data = await response.json();

        if (isMounted) {
          setResult(data);
        }
      } catch (requestError) {
        console.error("Error loading assessment result:", requestError);

        if (isMounted) {
          setError(
            "Unable to connect to NeuroSync. Please check your connection and try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResult();

    return () => {
      isMounted = false;
    };
  }, [assessmentId, navigate]);

  if (loading) {
    return (
      <main className="assessment-result-page"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          color: "#f4f4f5",
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              border: "3px solid rgba(255,255,255,0.12)",
              borderTopColor: "#34d399",
              borderRadius: "50%",
              margin: "0 auto 18px",
              animation: "spin 0.8s linear infinite",
            }}
          />

          <p
            style={{
              ...displayFont,
              margin: 0,
              fontSize: "18px",
            }}
          >
            Preparing your results...
          </p>
        </div>

        <style>
          {`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </main>
    );
  }

  if (error || !result?.interpretation) {
    return (
      <main className="assessment-result-page"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          color: "#f4f4f5",
          padding: "24px",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "560px",
            padding: "36px",
            borderRadius: "20px",
            background: "#111113",
            border: "1px solid rgba(255,255,255,0.08)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              ...monoFont,
              color: "#f87171",
              fontSize: "13px",
              letterSpacing: "0.08em",
              marginBottom: "12px",
            }}
          >
            RESULTS UNAVAILABLE
          </p>

          <h1
            style={{
              ...displayFont,
              margin: "0 0 12px",
              fontSize: "28px",
            }}
          >
            We couldn't load your results
          </h1>

          <p
            style={{
              color: "#a1a1aa",
              lineHeight: 1.6,
              marginBottom: "24px",
            }}
          >
            {error || "The assessment interpretation is not available right now."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={{
              border: "none",
              borderRadius: "10px",
              padding: "12px 20px",
              background: "#34d399",
              color: "#052e1b",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Back to Dashboard
          </button>
        </section>
      </main>
    );
  }

  const interpretation = result.interpretation;
  const strongest = interpretation.strongest_dimension;
  const priority = interpretation.priority_dimension;

  return (
    <main className="assessment-result-page"
      style={{
        minHeight: "100vh",
        background: "#09090b",
        color: "#f4f4f5",
        padding: "40px 20px 70px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <header style={{ marginBottom: "32px" }}>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={{
              border: "none",
              background: "transparent",
              color: "#a1a1aa",
              padding: 0,
              marginBottom: "24px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ← Back to Dashboard
          </button>

          <p
            style={{
              ...monoFont,
              color: "#34d399",
              fontSize: "12px",
              letterSpacing: "0.1em",
              marginBottom: "10px",
            }}
          >
            ASSESSMENT RESULTS
          </p>

          <h1
            style={{
              ...displayFont,
              fontSize: "36px",
              margin: "0 0 10px",
            }}
          >
            Your wellness snapshot
          </h1>

          <p
            style={{
              color: "#a1a1aa",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            This interpretation is generated from your completed NeuroSync
            assessment.
          </p>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(220px, 300px)",
            gap: "18px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              padding: "28px",
              borderRadius: "20px",
              background:
                "radial-gradient(ellipse at 0% 0%, rgba(129,140,248,0.22), transparent 58%), linear-gradient(135deg, #172554 0%, #123047 52%, #064e3b 100%)",
              border: "1px solid rgba(110,231,183,0.38)",
              boxShadow:
                "0 18px 45px rgba(15,23,42,0.24), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <p
              style={{
                ...monoFont,
                color: "#a7f3d0",
                fontSize: "12px",
                letterSpacing: "0.12em",
                fontWeight: 700,
                margin: "0 0 16px",
              }}
            >
              OVERALL WELLNESS
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  ...displayFont,
                  fontSize: "64px",
                  lineHeight: 1,
                  fontWeight: 700,
                }}
              >
                {interpretation.overall_score ?? "--"}
              </span>

              <span
                style={{
                  color: "#71717a",
                  fontSize: "14px",
                }}
              >
                / 100
              </span>
            </div>

            <p
              style={{
                margin: 0,
                color: "#a7f3d0",
                fontWeight: 700,
                fontSize: "17px",
              }}
            >
              {interpretation.overall_status || "Unavailable"}
            </p>
          </div>

          <div
            style={{
              padding: "28px",
              borderRadius: "20px",
              background: "#111113",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p
              style={{
                ...monoFont,
                color: "#71717a",
                fontSize: "12px",
                margin: "0 0 14px",
              }}
            >
              ASSESSMENT
            </p>

            <p
              style={{
                margin: "0 0 8px",
                color: "#f4f4f5",
                fontWeight: 600,
              }}
            >
              #{result.assessment_id}
            </p>

            {result.completed_at && (
              <p
                style={{
                  margin: 0,
                  color: "#71717a",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                Completed{" "}
                {new Date(result.completed_at).toLocaleString()}
              </p>
            )}
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "18px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              padding: "24px",
              borderRadius: "18px",
              background: "#111113",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p
              style={{
                ...monoFont,
                color: "#71717a",
                fontSize: "11px",
                margin: "0 0 10px",
              }}
            >
              STRONGEST DIMENSION
            </p>

            <h2
              style={{
                ...displayFont,
                fontSize: "22px",
                margin: "0 0 8px",
              }}
            >
              {strongest?.label || "Unavailable"}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#34d399",
                fontWeight: 700,
              }}
            >
              {strongest?.score ?? "--"} / 100
            </p>
          </div>

          <div
            style={{
              padding: "24px",
              borderRadius: "18px",
              background: "#111113",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p
              style={{
                ...monoFont,
                color: "#71717a",
                fontSize: "11px",
                margin: "0 0 10px",
              }}
            >
              PRIORITY DIMENSION
            </p>

            <h2
              style={{
                ...displayFont,
                fontSize: "22px",
                margin: "0 0 8px",
              }}
            >
              {priority?.label || "Unavailable"}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#fbbf24",
                fontWeight: 700,
              }}
            >
              {priority?.score ?? "--"} / 100
            </p>
          </div>
        </section>

        <section
          className="assessment-result-grid"
          style={{
            padding: "28px",
            borderRadius: "20px",
            background: "#111113",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <p
              style={{
                ...monoFont,
                color: "#71717a",
                fontSize: "12px",
                margin: "0 0 8px",
              }}
            >
              WELLNESS DIMENSIONS
            </p>

            <h2
              style={{
                ...displayFont,
                fontSize: "26px",
                margin: 0,
              }}
            >
              Your current indicators
            </h2>
          </div>

          <div style={{ display: "grid", gap: "24px" }}>
            {interpretation.dimensions.map((dimension) => (
              <article key={dimension.dimension}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "16px",
                    marginBottom: "9px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        ...displayFont,
                        fontSize: "17px",
                        margin: "0 0 4px",
                      }}
                    >
                      {dimension.label}
                    </h3>

                    <span
                      style={{
                        color: "#71717a",
                        fontSize: "13px",
                      }}
                    >
                      {dimension.status || "Unavailable"}
                    </span>
                  </div>

                  <strong
                    style={{
                      ...monoFont,
                      fontSize: "14px",
                    }}
                  >
                    {dimension.score ?? "--"}
                  </strong>
                </div>

                <div
                  style={{
                    height: "7px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.07)",
                    overflow: "hidden",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: getScoreWidth(dimension.score),
                      height: "100%",
                      borderRadius: "999px",
                      background: "#34d399",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>

                <p
                  style={{
                    margin: 0,
                    color: "#a1a1aa",
                    fontSize: "14px",
                    lineHeight: 1.6,
                  }}
                >
                  {dimension.guidance ||
                    "No guidance is currently available for this dimension."}
                </p>
              </article>
            ))}
          </div>
        </section>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "26px",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={{
              border: "none",
              borderRadius: "11px",
              padding: "14px 24px",
              background: "#34d399",
              color: "#052e1b",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Continue to Dashboard
          </button>
        </div>
      </div>







      <style>{`
        /* =====================================================
           NeuroSync ? Calm Aurora Results
           Final visual system
           ===================================================== */

        html:has(.assessment-result-page),
        body:has(.assessment-result-page),
        #root:has(.assessment-result-page) {
          background: #07111f !important;
        }

        .assessment-result-page {
          --result-teal: #2dd4bf;
          --result-cyan: #38bdf8;
          --result-blue: #60a5fa;
          --result-violet: #8b5cf6;
          --result-pink: #ec4899;
          --result-amber: #fbbf24;

          position: relative !important;
          min-height: 100vh !important;
          overflow: visible !important;
          isolation: isolate;

          color: #f5f7ff !important;

          background:
            radial-gradient(
              circle at 7% 5%,
              rgba(45,212,191,0.19),
              transparent 25%
            ),
            radial-gradient(
              circle at 94% 8%,
              rgba(99,102,241,0.21),
              transparent 28%
            ),
            radial-gradient(
              circle at 83% 75%,
              rgba(139,92,246,0.15),
              transparent 30%
            ),
            radial-gradient(
              circle at 12% 88%,
              rgba(56,189,248,0.10),
              transparent 25%
            ),
            linear-gradient(
              145deg,
              #07111f 0%,
              #0a1529 42%,
              #111a35 72%,
              #17152f 100%
            ) !important;

          background-attachment: fixed !important;
        }

        .assessment-result-page::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: -1;

          background:
            linear-gradient(
              120deg,
              transparent,
              rgba(45,212,191,0.035) 38%,
              rgba(139,92,246,0.05) 65%,
              transparent
            );
        }

        .assessment-result-page > * {
          position: relative;
          z-index: 1;
        }

        .assessment-result-page h1 {
          background:
            linear-gradient(
              100deg,
              #ffffff,
              #b9fff0 35%,
              #93c5fd 67%,
              #ddd6fe
            ) !important;

          -webkit-background-clip: text;
          background-clip: text;
          color: transparent !important;

          text-shadow:
            0 0 35px rgba(45,212,191,0.08);
        }

        .assessment-result-page section {
          position: relative !important;
          overflow: hidden !important;

          background:
            linear-gradient(
              135deg,
              rgba(17,36,61,0.88),
              rgba(16,29,53,0.78) 54%,
              rgba(34,25,61,0.74)
            ) !important;

          border: 1px solid rgba(148,163,184,0.16) !important;

          box-shadow:
            0 22px 65px rgba(0,0,0,0.24),
            inset 0 1px 0 rgba(255,255,255,0.055) !important;

          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);

          transition:
            transform 180ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease;
        }

        .assessment-result-page section::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 3px;

          background:
            linear-gradient(
              90deg,
              var(--result-teal),
              var(--result-cyan),
              var(--result-violet),
              var(--result-pink)
            );

          opacity: 0.78;
        }

        .assessment-result-page section:hover {
          transform: translateY(-2px);

          border-color:
            rgba(56,189,248,0.26) !important;

          box-shadow:
            0 28px 75px rgba(0,0,0,0.28),
            0 0 38px rgba(56,189,248,0.055),
            inset 0 1px 0 rgba(255,255,255,0.065) !important;
        }

        /* Overall score */

        .assessment-result-page section:first-of-type {
          background:
            radial-gradient(
              circle at 88% 18%,
              rgba(45,212,191,0.18),
              transparent 36%
            ),
            radial-gradient(
              circle at 18% 90%,
              rgba(56,189,248,0.10),
              transparent 34%
            ),
            linear-gradient(
              135deg,
              rgba(16,55,67,0.92),
              rgba(18,34,61,0.88),
              rgba(39,27,69,0.80)
            ) !important;

          border-color:
            rgba(45,212,191,0.30) !important;

          box-shadow:
            0 28px 80px rgba(0,0,0,0.30),
            0 0 75px rgba(45,212,191,0.09),
            inset 0 1px 0 rgba(255,255,255,0.075) !important;
        }

        .assessment-result-page section:first-of-type span[style*="fontSize: 64px"] {
          color: #ffffff !important;
          text-shadow:
            0 0 30px rgba(45,212,191,0.16);
        }

        /* Assessment metadata */

        .assessment-result-page section:first-of-type > div:nth-child(2) {
          background:
            linear-gradient(
              135deg,
              rgba(30,41,70,0.56),
              rgba(23,34,59,0.42)
            ) !important;

          border: 1px solid rgba(148,163,184,0.10) !important;
          border-radius: 16px;
        }

        /* Strongest / priority */

        .assessment-result-page section:nth-of-type(2) > div:first-child {
          background:
            linear-gradient(
              135deg,
              rgba(13,148,136,0.20),
              rgba(14,116,144,0.10),
              rgba(25,39,62,0.78)
            ) !important;

          border: 1px solid rgba(45,212,191,0.18) !important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.045),
            0 18px 45px rgba(0,0,0,0.18);
        }

        .assessment-result-page section:nth-of-type(2) > div:nth-child(2) {
          background:
            linear-gradient(
              135deg,
              rgba(139,92,246,0.20),
              rgba(236,72,153,0.09),
              rgba(30,35,65,0.78)
            ) !important;

          border: 1px solid rgba(139,92,246,0.18) !important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.045),
            0 18px 45px rgba(0,0,0,0.18);
        }

        /* Dimension container */

        .assessment-result-page .assessment-result-grid {
          background:
            linear-gradient(
              135deg,
              rgba(16,30,52,0.90),
              rgba(17,29,54,0.78)
            ) !important;
        }

        .assessment-result-page .assessment-result-grid article {
          padding: 18px !important;
          border-radius: 16px;

          background:
            linear-gradient(
              135deg,
              rgba(30,45,72,0.52),
              rgba(20,34,59,0.38)
            );

          border: 1px solid rgba(148,163,184,0.10);

          transition:
            transform 180ms ease,
            border-color 180ms ease,
            background 180ms ease;
        }

        .assessment-result-page .assessment-result-grid article:hover {
          transform: translateX(3px);

          border-color:
            rgba(125,211,252,0.22);

          background:
            linear-gradient(
              135deg,
              rgba(34,55,84,0.62),
              rgba(25,39,68,0.46)
            );
        }

        .assessment-result-page .assessment-result-grid article:nth-child(1) {
          border-left: 3px solid rgba(45,212,191,0.70);
        }

        .assessment-result-page .assessment-result-grid article:nth-child(2) {
          border-left: 3px solid rgba(56,189,248,0.70);
        }

        .assessment-result-page .assessment-result-grid article:nth-child(3) {
          border-left: 3px solid rgba(139,92,246,0.70);
        }

        .assessment-result-page .assessment-result-grid article:nth-child(4) {
          border-left: 3px solid rgba(236,72,153,0.62);
        }

        /* Dimension progress tracks */

        .assessment-result-page article > div > div[style*="height: 7px"] {
          background:
            rgba(148,163,184,0.12) !important;

          box-shadow:
            inset 0 1px 3px rgba(0,0,0,0.34);
        }

        .assessment-result-page article:nth-child(1)
        div[style*="height: 100%"] {
          background:
            linear-gradient(90deg, #14b8a6, #2dd4bf) !important;

          box-shadow:
            0 0 15px rgba(45,212,191,0.30);
        }

        .assessment-result-page article:nth-child(2)
        div[style*="height: 100%"] {
          background:
            linear-gradient(90deg, #0ea5e9, #38bdf8) !important;

          box-shadow:
            0 0 15px rgba(56,189,248,0.30);
        }

        .assessment-result-page article:nth-child(3)
        div[style*="height: 100%"] {
          background:
            linear-gradient(90deg, #7c3aed, #a78bfa) !important;

          box-shadow:
            0 0 15px rgba(139,92,246,0.30);
        }

        .assessment-result-page article:nth-child(4)
        div[style*="height: 100%"] {
          background:
            linear-gradient(90deg, #db2777, #f472b6) !important;

          box-shadow:
            0 0 15px rgba(236,72,153,0.26);
        }

        /* Text hierarchy */

        .assessment-result-page section p {
          color: #aebbd0 !important;
        }

        .assessment-result-page section h2,
        .assessment-result-page section h3 {
          color: #f5f7ff !important;
        }

        /* CTA */

        .assessment-result-page button {
          position: relative !important;
          overflow: hidden !important;

          border: 0 !important;
          border-radius: 15px !important;

          background:
            linear-gradient(
              105deg,
              #14b8a6,
              #22d3ee 38%,
              #6366f1 72%,
              #8b5cf6
            ) !important;

          color: #ffffff !important;

          box-shadow:
            0 16px 42px rgba(20,184,166,0.22),
            0 0 35px rgba(99,102,241,0.12) !important;

          transition:
            transform 180ms ease,
            filter 180ms ease,
            box-shadow 180ms ease;
        }

        .assessment-result-page button:hover {
          transform: translateY(-3px);
          filter: brightness(1.07);

          box-shadow:
            0 22px 55px rgba(20,184,166,0.30),
            0 0 45px rgba(99,102,241,0.18) !important;
        }

        .assessment-result-page button::before {
          content: "";
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              115deg,
              transparent 15%,
              rgba(255,255,255,0.26) 50%,
              transparent 85%
            );

          transform: translateX(-120%);
          transition: transform 600ms ease;
        }

        .assessment-result-page button:hover::before {
          transform: translateX(120%);
        }

        @media (max-width: 700px) {
          .assessment-result-page {
            background-attachment: scroll !important;
          }

          .assessment-result-page section {
            border-radius: 18px !important;
          }

          .assessment-result-page section:first-of-type {
            grid-template-columns: 1fr !important;
          }

          .assessment-result-page .assessment-result-grid article {
            padding: 15px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .assessment-result-page section,
          .assessment-result-page article,
          .assessment-result-page button {
            transition: none !important;
          }
        }
      `}</style>


<style>{`
/* NeuroSync Results - Final Authoritative Visual Override */

html:has(.assessment-result-page),
body:has(.assessment-result-page),
#root:has(.assessment-result-page) {
  min-height: 100%;
  background: #07111f !important;
}

html:has(.assessment-result-page) {
  background:
    radial-gradient(circle at 12% 10%, rgba(45,212,191,0.16), transparent 28%),
    radial-gradient(circle at 88% 14%, rgba(139,92,246,0.18), transparent 30%),
    radial-gradient(circle at 50% 90%, rgba(56,189,248,0.12), transparent 34%),
    #07111f !important;
}

body:has(.assessment-result-page) {
  margin: 0 !important;
  background:
    radial-gradient(circle at 12% 10%, rgba(45,212,191,0.16), transparent 28%),
    radial-gradient(circle at 88% 14%, rgba(139,92,246,0.18), transparent 30%),
    radial-gradient(circle at 50% 90%, rgba(56,189,248,0.12), transparent 34%),
    #07111f !important;
}

#root:has(.assessment-result-page) {
  background: transparent !important;
}

.assessment-result-page {
  position: relative !important;
  isolation: isolate !important;
  min-height: 100vh !important;
  width: 100% !important;
  box-sizing: border-box !important;
  overflow: hidden !important;

  background:
    radial-gradient(circle at 8% 8%, rgba(45,212,191,0.20), transparent 26%),
    radial-gradient(circle at 92% 8%, rgba(139,92,246,0.20), transparent 28%),
    radial-gradient(circle at 50% 48%, rgba(59,130,246,0.09), transparent 34%),
    radial-gradient(circle at 78% 92%, rgba(244,114,182,0.10), transparent 28%),
    linear-gradient(145deg, #07111f 0%, #0a1630 48%, #11142c 100%) !important;

  color: #f8fbff !important;
}

.assessment-result-page::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  pointer-events: none !important;
  z-index: -1 !important;

  background:
    radial-gradient(circle at 22% 24%, rgba(45,212,191,0.12), transparent 18%),
    radial-gradient(circle at 80% 30%, rgba(167,139,250,0.12), transparent 20%),
    radial-gradient(circle at 42% 82%, rgba(56,189,248,0.08), transparent 22%) !important;
}

.assessment-result-page > div {
  position: relative !important;
  z-index: 1 !important;
}

.assessment-result-page header {
  position: relative !important;
}

.assessment-result-page header::after {
  content: "" !important;
  position: absolute !important;
  left: 0 !important;
  bottom: -18px !important;
  width: 150px !important;
  height: 2px !important;
  border-radius: 999px !important;
  background: linear-gradient(90deg, #2dd4bf, #8b5cf6, transparent) !important;
  opacity: 0.75 !important;
}

.assessment-result-page section {
  position: relative !important;
  overflow: hidden !important;

  background:
    linear-gradient(145deg, rgba(18,31,55,0.88), rgba(13,23,45,0.82)) !important;

  border: 1px solid rgba(148,163,184,0.17) !important;
  box-shadow:
    0 24px 70px rgba(0,0,0,0.28),
    inset 0 1px 0 rgba(255,255,255,0.045) !important;

  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
}

.assessment-result-page section::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  pointer-events: none !important;

  background:
    linear-gradient(
      135deg,
      rgba(45,212,191,0.07),
      transparent 34%,
      rgba(139,92,246,0.06)
    ) !important;
}

.assessment-result-page section:first-of-type {
  background:
    radial-gradient(circle at 78% 20%, rgba(45,212,191,0.14), transparent 26%),
    radial-gradient(circle at 15% 90%, rgba(139,92,246,0.13), transparent 28%),
    linear-gradient(145deg, rgba(20,36,63,0.94), rgba(12,24,48,0.90)) !important;

  border-color: rgba(94,234,212,0.22) !important;

  box-shadow:
    0 30px 90px rgba(15,23,42,0.42),
    0 0 70px rgba(45,212,191,0.07),
    inset 0 1px 0 rgba(255,255,255,0.06) !important;
}

.assessment-result-page section:nth-of-type(2) {
  background:
    radial-gradient(circle at 20% 15%, rgba(139,92,246,0.12), transparent 25%),
    linear-gradient(145deg, rgba(22,30,57,0.90), rgba(13,23,45,0.86)) !important;
}

.assessment-result-page section:nth-of-type(3) {
  background:
    radial-gradient(circle at 82% 18%, rgba(56,189,248,0.10), transparent 25%),
    linear-gradient(145deg, rgba(17,30,54,0.90), rgba(13,23,45,0.86)) !important;
}

.assessment-result-page section:first-of-type span[style*="fontSize: 64px"] {
  display: inline-block !important;
  color: transparent !important;
  background: linear-gradient(135deg, #67e8f9 0%, #5eead4 45%, #a78bfa 100%) !important;
  background-clip: text !important;
  -webkit-background-clip: text !important;
  text-shadow: 0 0 36px rgba(94,234,212,0.16) !important;
}

.assessment-result-page section:first-of-type p {
  color: #b8c7dc !important;
}

.assessment-result-page section:nth-of-type(2) > div {
  background:
    linear-gradient(145deg, rgba(24,39,68,0.78), rgba(16,28,52,0.72)) !important;
  border-color: rgba(148,163,184,0.15) !important;
}

.assessment-result-page section:nth-of-type(2) > div:first-child {
  border-color: rgba(45,212,191,0.20) !important;
  box-shadow: inset 3px 0 0 rgba(45,212,191,0.60) !important;
}

.assessment-result-page section:nth-of-type(2) > div:nth-child(2) {
  border-color: rgba(251,191,36,0.18) !important;
  box-shadow: inset 3px 0 0 rgba(251,191,36,0.52) !important;
}

.assessment-result-page .assessment-result-grid {
  background:
    linear-gradient(145deg, rgba(16,28,52,0.90), rgba(11,22,43,0.86)) !important;
}

.assessment-result-page .assessment-result-grid article {
  position: relative !important;
  overflow: hidden !important;

  background:
    linear-gradient(145deg, rgba(24,39,68,0.80), rgba(15,27,50,0.72)) !important;

  border: 1px solid rgba(148,163,184,0.14) !important;
  border-radius: 18px !important;

  box-shadow:
    0 16px 40px rgba(0,0,0,0.18),
    inset 0 1px 0 rgba(255,255,255,0.035) !important;

  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease !important;
}

.assessment-result-page .assessment-result-grid article:nth-child(1) {
  border-color: rgba(45,212,191,0.20) !important;
  background:
    linear-gradient(145deg, rgba(18,52,59,0.64), rgba(15,31,52,0.74)) !important;
}

.assessment-result-page .assessment-result-grid article:nth-child(2) {
  border-color: rgba(139,92,246,0.22) !important;
  background:
    linear-gradient(145deg, rgba(42,31,69,0.64), rgba(18,29,54,0.74)) !important;
}

.assessment-result-page .assessment-result-grid article:nth-child(3) {
  border-color: rgba(56,189,248,0.20) !important;
  background:
    linear-gradient(145deg, rgba(20,45,70,0.64), rgba(15,28,52,0.74)) !important;
}

.assessment-result-page .assessment-result-grid article:nth-child(4) {
  border-color: rgba(244,114,182,0.18) !important;
  background:
    linear-gradient(145deg, rgba(55,31,58,0.58), rgba(20,27,51,0.74)) !important;
}

.assessment-result-page .assessment-result-grid article:hover {
  transform: translateY(-3px) !important;
  border-color: rgba(148,163,184,0.28) !important;
  box-shadow:
    0 20px 48px rgba(0,0,0,0.24),
    0 0 28px rgba(94,234,212,0.055) !important;
}

.assessment-result-page article > div > div[style*="height: 7px"] {
  background: rgba(148,163,184,0.13) !important;
  border: 1px solid rgba(148,163,184,0.08) !important;
}

.assessment-result-page article:nth-child(1) div[style*="height: 100%"] {
  background: linear-gradient(90deg, #14b8a6, #5eead4) !important;
}

.assessment-result-page article:nth-child(2) div[style*="height: 100%"] {
  background: linear-gradient(90deg, #7c3aed, #a78bfa) !important;
}

.assessment-result-page article:nth-child(3) div[style*="height: 100%"] {
  background: linear-gradient(90deg, #0284c7, #67e8f9) !important;
}

.assessment-result-page article:nth-child(4) div[style*="height: 100%"] {
  background: linear-gradient(90deg, #db2777, #f9a8d4) !important;
}

.assessment-result-page section p {
  color: #b8c7dc !important;
}

.assessment-result-page section h2,
.assessment-result-page section h3 {
  color: #f7f9ff !important;
}

.assessment-result-page button {
  border: 1px solid rgba(148,163,184,0.20) !important;
  border-radius: 12px !important;

  background:
    linear-gradient(135deg, #2dd4bf 0%, #38bdf8 48%, #8b5cf6 100%) !important;

  color: #07111f !important;

  box-shadow:
    0 12px 30px rgba(56,189,248,0.16),
    0 0 28px rgba(139,92,246,0.08) !important;

  font-weight: 700 !important;
  cursor: pointer !important;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease !important;
}

.assessment-result-page button:hover {
  transform: translateY(-2px) !important;
  filter: brightness(1.06) !important;
  box-shadow:
    0 16px 36px rgba(56,189,248,0.22),
    0 0 36px rgba(139,92,246,0.12) !important;
}

.assessment-result-page button:focus-visible {
  outline: 3px solid rgba(103,232,249,0.45) !important;
  outline-offset: 3px !important;
}

.assessment-result-page header button {
  background: transparent !important;
  color: #aebbd0 !important;
  border: 1px solid transparent !important;
  box-shadow: none !important;
}

.assessment-result-page header button:hover {
  color: #f5f7ff !important;
  background: rgba(148,163,184,0.08) !important;
  border-color: rgba(148,163,184,0.12) !important;
  box-shadow: none !important;
  filter: none !important;
}

@media (max-width: 760px) {
  .assessment-result-page {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  .assessment-result-page section {
    border-radius: 16px !important;
  }

  .assessment-result-page section:first-of-type {
    grid-template-columns: 1fr !important;
  }

  .assessment-result-page section:nth-of-type(2) {
    grid-template-columns: 1fr !important;
  }

  .assessment-result-page .assessment-result-grid {
    grid-template-columns: 1fr !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .assessment-result-page *,
  .assessment-result-page *::before,
  .assessment-result-page *::after {
    transition: none !important;
    animation: none !important;
  }
}
`}</style>
</main>
  );
}

export default AssessmentResult;

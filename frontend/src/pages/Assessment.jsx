import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { clearTokens } from "../services/auth";

const displayFont = {
  fontFamily: "'Space Grotesk', sans-serif",
};

const monoFont = {
  fontFamily: "'IBM Plex Mono', monospace",
};

const questions = [
  {
    id: "stress_worry",
    question: "How often did you feel worried today?",
    options: [
      { value: 1, label: "Never" },
      { value: 2, label: "Rarely" },
      { value: 3, label: "Sometimes" },
      { value: 4, label: "Often" },
      { value: 5, label: "Very often" },
    ],
  },
  {
    id: "stress_pressure",
    question: "How often did you feel under pressure?",
    options: [
      { value: 1, label: "Never" },
      { value: 2, label: "Rarely" },
      { value: 3, label: "Sometimes" },
      { value: 4, label: "Often" },
      { value: 5, label: "Very often" },
    ],
  },
  {
    id: "stress_relax",
    question: "How hard was it to relax today?",
    options: [
      { value: 1, label: "Very easy" },
      { value: 2, label: "Easy" },
      { value: 3, label: "Sometimes difficult" },
      { value: 4, label: "Difficult" },
      { value: 5, label: "Very difficult" },
    ],
  },
  {
    id: "stress_upset",
    question: "How often did small things make you feel upset?",
    options: [
      { value: 1, label: "Never" },
      { value: 2, label: "Rarely" },
      { value: 3, label: "Sometimes" },
      { value: 4, label: "Often" },
      { value: 5, label: "Very often" },
    ],
  },
  {
    id: "energy_level",
    question: "How much energy did you have today?",
    options: [
      { value: 1, label: "Very low" },
      { value: 2, label: "Low" },
      { value: 3, label: "Okay" },
      { value: 4, label: "Good" },
      { value: 5, label: "Very high" },
    ],
  },
  {
    id: "daytime_tiredness",
    question: "How tired did you feel during the day?",
    options: [
      { value: 1, label: "Not tired" },
      { value: 2, label: "A little tired" },
      { value: 3, label: "Moderately tired" },
      { value: 4, label: "Very tired" },
      { value: 5, label: "Extremely tired" },
    ],
  },
  {
    id: "sleep_refresh",
    question: "How fresh did you feel after sleeping?",
    options: [
      { value: 1, label: "Not fresh at all" },
      { value: 2, label: "Slightly fresh" },
      { value: 3, label: "Okay" },
      { value: 4, label: "Fresh" },
      { value: 5, label: "Very fresh" },
    ],
  },
  {
    id: "task_start",
    question: "How hard was it to get started with your tasks?",
    options: [
      { value: 1, label: "Very easy" },
      { value: 2, label: "Easy" },
      { value: 3, label: "Sometimes difficult" },
      { value: 4, label: "Difficult" },
      { value: 5, label: "Very difficult" },
    ],
  },
  {
    id: "mood",
    question: "How would you describe your mood today?",
    options: [
      { value: 1, label: "Very low" },
      { value: 2, label: "Low" },
      { value: 3, label: "Okay" },
      { value: 4, label: "Good" },
      { value: 5, label: "Very good" },
    ],
  },
  {
    id: "enjoyment",
    question: "How interested were you in things you usually enjoy?",
    options: [
      { value: 1, label: "Not interested" },
      { value: 2, label: "Slightly interested" },
      { value: 3, label: "Somewhat interested" },
      { value: 4, label: "Very interested" },
      { value: 5, label: "Extremely interested" },
    ],
  },
  {
    id: "positivity",
    question: "How positive did you feel today?",
    options: [
      { value: 1, label: "Not positive" },
      { value: 2, label: "Slightly positive" },
      { value: 3, label: "Somewhat positive" },
      { value: 4, label: "Very positive" },
      { value: 5, label: "Extremely positive" },
    ],
  },
  {
    id: "emotional_control",
    question: "How well could you handle your feelings today?",
    options: [
      { value: 1, label: "Very poorly" },
      { value: 2, label: "Poorly" },
      { value: 3, label: "Okay" },
      { value: 4, label: "Well" },
      { value: 5, label: "Very well" },
    ],
  },
  {
    id: "focus",
    question: "How well could you focus today?",
    options: [
      { value: 1, label: "Very poorly" },
      { value: 2, label: "Poorly" },
      { value: 3, label: "Okay" },
      { value: 4, label: "Well" },
      { value: 5, label: "Very well" },
    ],
  },
  {
    id: "distraction",
    question: "How easily did your mind get distracted?",
    options: [
      { value: 1, label: "Not at all" },
      { value: 2, label: "A little" },
      { value: 3, label: "Sometimes" },
      { value: 4, label: "Often" },
      { value: 5, label: "Very easily" },
    ],
  },
  {
    id: "clarity",
    question: "How clearly could you think today?",
    options: [
      { value: 1, label: "Very unclearly" },
      { value: 2, label: "Unclearly" },
      { value: 3, label: "Okay" },
      { value: 4, label: "Clearly" },
      { value: 5, label: "Very clearly" },
    ],
  },
  {
    id: "task_completion",
    question: "How well could you finish your tasks?",
    options: [
      { value: 1, label: "Very poorly" },
      { value: 2, label: "Poorly" },
      { value: 3, label: "Okay" },
      { value: 4, label: "Well" },
      { value: 5, label: "Very well" },
    ],
  },
];

function Assessment() {
  const navigate = useNavigate();

  const [assessmentId, setAssessmentId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const createAssessment = async () => {
      try {
        const response = await apiRequest("/assessments/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        if (response.status === 401) {
          clearTokens();

          if (isMounted) {
            navigate("/login", { replace: true });
          }

          return;
        }

        if (!response.ok) {
          if (isMounted) {
            setError(
              "We couldn't start your assessment. Please try again."
            );
          }

          return;
        }

        const data = await response.json();

        if (isMounted) {
          setAssessmentId(data.id);
        }
      } catch (requestError) {
        console.error("Error creating assessment:", requestError);

        if (isMounted) {
          setError(
            "Unable to connect to NeuroSync. Please make sure the server is running."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    createAssessment();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const unansweredQuestion = questions.find(
      (question) => answers[question.id] === undefined
    );

    if (unansweredQuestion) {
      setError("Please answer every question before continuing.");
      return;
    }

    if (!assessmentId) {
      setError("Assessment session is not ready yet. Please try again.");
      return;
    }

    setSubmitting(true);

    try {
      const inputResponse = await apiRequest(
        `/assessments/${assessmentId}/inputs/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input_type: "cognitive",
            metadata: {
              responses: answers,
            },
          }),
        }
      );

      if (inputResponse.status === 401) {
        clearTokens();
        navigate("/login", { replace: true });
        return;
      }

      if (!inputResponse.ok) {
        let message = "We couldn't save your assessment.";

        try {
          const data = await inputResponse.json();

          if (data.detail) {
            message = data.detail;
          }
        } catch {
          // Keep the generic message if the response is not JSON.
        }

        setError(message);
        return;
      }

      const completeResponse = await apiRequest(
        `/assessments/${assessmentId}/complete/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (completeResponse.status === 401) {
        clearTokens();
        navigate("/login", { replace: true });
        return;
      }

      if (!completeResponse.ok) {
        let message = "We couldn't complete your assessment.";

        try {
          const data = await completeResponse.json();

          if (data.detail) {
            message = data.detail;
          }
        } catch {
          // Keep the generic message if the response is not JSON.
        }

        setError(message);
        return;
      }

      navigate(`/assessment/${assessmentId}/result`, { replace: true });
    } catch (requestError) {
      console.error("Error submitting assessment:", requestError);

      setError(
        "Unable to connect to NeuroSync. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="neurosync-assessment-page"
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
            Preparing your assessment...
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

  if (error && !assessmentId) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          color: "#f4f4f5",
          padding: "24px",
        }}
         className="neurosync-assessment-page">
        <section
          style={{
            width: "100%",
            maxWidth: "520px",
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
              marginBottom: "12px",
            }}
          >
            ASSESSMENT ERROR
          </p>

          <h1
            style={{
              ...displayFont,
              margin: "0 0 12px",
              fontSize: "28px",
            }}
          >
            We couldn't start the assessment
          </h1>

          <p
            style={{
              color: "#a1a1aa",
              lineHeight: 1.6,
              marginBottom: "24px",
            }}
          >
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
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
            Try again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#09090b",
        color: "#f4f4f5",
        padding: "40px 20px 70px",
      }}
      className="neurosync-assessment-page">
      <div
        style={{
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto",
        }}
      >
        <header style={{ marginBottom: "36px" }}>
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
            ← Back to dashboard
          </button>

          <p
            style={{
              ...monoFont,
              color: "#34d399",
              fontSize: "12px",
              letterSpacing: "0.08em",
              marginBottom: "10px",
            }}
          >
            WELLNESS CHECK-IN
          </p>

          <h1
            style={{
              ...displayFont,
              fontSize: "clamp(32px, 6vw, 48px)",
              lineHeight: 1.05,
              margin: "0 0 16px",
            }}
          >
            Check in with your mind.
          </h1>

          <p
            style={{
              color: "#a1a1aa",
              maxWidth: "620px",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Answer these questions based on how you genuinely feel. There are
            no right or wrong answers.
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: "18px" }}>
            {questions.map((question, index) => (
              <section
                key={question.id}
                style={{
                  padding: "24px",
                  borderRadius: "18px",
                  background: "#111113",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    ...monoFont,
                    color: "#71717a",
                    fontSize: "11px",
                    marginBottom: "10px",
                  }}
                >
                  QUESTION {String(index + 1).padStart(2, "0")}
                </div>

                <h2
                  style={{
                    ...displayFont,
                    fontSize: "20px",
                    lineHeight: 1.4,
                    margin: "0 0 20px",
                  }}
                >
                  {question.question}
                </h2>

                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  {question.options.map((option) => {
                    const selected = answers[question.id] === option.value;

                    return (
                      <label
                        key={option.value}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "13px 14px",
                          borderRadius: "10px",
                          border: selected
                            ? "1px solid rgba(52,211,153,0.55)"
                            : "1px solid rgba(255,255,255,0.07)",
                          background: selected
                            ? "rgba(52,211,153,0.08)"
                            : "rgba(255,255,255,0.02)",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option.value}
                          checked={selected}
                          onChange={() =>
                            handleAnswerChange(
                              question.id,
                              option.value
                            )
                          }
                        />

                        <span
                          style={{
                            color: selected ? "#f4f4f5" : "#a1a1aa",
                          }}
                        >
                          {option.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {error && (
            <div
              role="alert"
              style={{
                marginTop: "18px",
                padding: "14px 16px",
                borderRadius: "12px",
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.2)",
                color: "#fca5a5",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "26px",
            }}
          >
            <button
              type="submit"
              disabled={submitting}
              style={{
                border: "none",
                borderRadius: "11px",
                padding: "14px 24px",
                background: submitting ? "#166534" : "#34d399",
                color: "#052e1b",
                fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                minWidth: "180px",
              }}
            >
              {submitting ? "Processing..." : "Complete Check-in"}
            </button>
          </div>
        </form>
      </div>


      <style>{`
        /* =====================================================
           NeuroSync Assessment ? Wellness Atmosphere
           ===================================================== */

        .neurosync-assessment-page {
          --ns-bg: #08111f;
          --ns-surface: rgba(15, 23, 42, 0.72);
          --ns-surface-strong: rgba(17, 25, 45, 0.88);
          --ns-text: #f8fafc;
          --ns-muted: #a7b4c7;
          --ns-teal: #2dd4bf;
          --ns-cyan: #38bdf8;
          --ns-violet: #8b5cf6;
          --ns-pink: #ec4899;

          position: relative;
          isolation: isolate;
          min-height: 100vh;
          overflow: hidden;

          background:
            radial-gradient(
              circle at 8% 5%,
              rgba(45, 212, 191, 0.22),
              transparent 27%
            ),
            radial-gradient(
              circle at 92% 8%,
              rgba(99, 102, 241, 0.24),
              transparent 30%
            ),
            radial-gradient(
              circle at 80% 72%,
              rgba(168, 85, 247, 0.16),
              transparent 32%
            ),
            radial-gradient(
              circle at 15% 88%,
              rgba(56, 189, 248, 0.13),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              #07101d 0%,
              #0b1427 38%,
              #10142b 68%,
              #160f27 100%
            ) !important;

          color: var(--ns-text);
        }

        /* Ambient light blobs */

        .neurosync-assessment-page::before,
        .neurosync-assessment-page::after {
          content: "";
          position: fixed;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          pointer-events: none;
          z-index: -1;
          filter: blur(110px);
          opacity: 0.22;
        }

        .neurosync-assessment-page::before {
          top: -260px;
          left: -190px;
          background:
            radial-gradient(
              circle,
              rgba(45, 212, 191, 0.9) 0%,
              rgba(45, 212, 191, 0.25) 38%,
              transparent 72%
            );
          animation: ns-assessment-float-a 12s ease-in-out infinite alternate;
        }

        .neurosync-assessment-page::after {
          right: -250px;
          bottom: -260px;
          background:
            radial-gradient(
              circle,
              rgba(139, 92, 246, 0.85) 0%,
              rgba(99, 102, 241, 0.25) 40%,
              transparent 72%
            );
          animation: ns-assessment-float-b 15s ease-in-out infinite alternate;
        }

        /* Main content */

        .neurosync-assessment-page > * {
          position: relative;
          z-index: 1;
        }

        .neurosync-assessment-page header {
          position: relative;
          padding: 34px 34px 28px !important;
          border-radius: 28px !important;

          background:
            linear-gradient(
              135deg,
              rgba(45, 212, 191, 0.12),
              rgba(99, 102, 241, 0.10) 52%,
              rgba(168, 85, 247, 0.10)
            ) !important;

          border: 1px solid rgba(148, 163, 184, 0.16) !important;

          box-shadow:
            0 24px 70px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);

          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .neurosync-assessment-page header::after {
          content: "";
          position: absolute;
          left: 34px;
          right: 34px;
          bottom: 0;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(45, 212, 191, 0.7),
              rgba(139, 92, 246, 0.7),
              transparent
            );
        }

        .neurosync-assessment-page header h1 {
          background:
            linear-gradient(
              100deg,
              #ffffff 0%,
              #b9fff0 42%,
              #a5b4fc 78%,
              #ddd6fe 100%
            );

          -webkit-background-clip: text;
          background-clip: text;
          color: transparent !important;
        }

        .neurosync-assessment-page header p {
          color: #b8c5d8 !important;
        }

        /* Question cards */

        .neurosync-assessment-page form > div > section {
          position: relative;
          overflow: hidden;

          padding: 28px !important;
          border-radius: 24px !important;

          background:
            linear-gradient(
              145deg,
              rgba(22, 34, 58, 0.88),
              rgba(13, 23, 42, 0.76) 55%,
              rgba(32, 22, 58, 0.72)
            ) !important;

          border: 1px solid rgba(148, 163, 184, 0.15) !important;

          box-shadow:
            0 18px 50px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.045);

          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);

          transition:
            transform 220ms ease,
            border-color 220ms ease,
            box-shadow 220ms ease;
        }

        .neurosync-assessment-page form > div > section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 5px;
          height: 100%;

          background:
            linear-gradient(
              180deg,
              #2dd4bf,
              #38bdf8 48%,
              #8b5cf6
            );

          opacity: 0.75;
        }

        .neurosync-assessment-page form > div > section:hover {
          transform: translateY(-2px);

          border-color:
            rgba(45, 212, 191, 0.30) !important;

          box-shadow:
            0 25px 65px rgba(0, 0, 0, 0.30),
            0 0 40px rgba(45, 212, 191, 0.07),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }

        .neurosync-assessment-page form > div > section h2,
        .neurosync-assessment-page form > div > section h3 {
          color: #f8fafc !important;
        }

        /* Answer options */

        .neurosync-assessment-page label {
          position: relative;
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;

          padding: 15px 17px !important;
          margin-top: 10px !important;

          border-radius: 15px !important;

          background:
            linear-gradient(
              135deg,
              rgba(30, 41, 59, 0.72),
              rgba(15, 23, 42, 0.65)
            ) !important;

          border: 1px solid rgba(148, 163, 184, 0.13) !important;

          color: #dbe5f2 !important;

          cursor: pointer;

          transition:
            transform 160ms ease,
            border-color 160ms ease,
            background 160ms ease,
            box-shadow 160ms ease;
        }

        .neurosync-assessment-page label:hover {
          transform: translateX(4px);

          background:
            linear-gradient(
              135deg,
              rgba(45, 212, 191, 0.13),
              rgba(56, 189, 248, 0.08),
              rgba(139, 92, 246, 0.10)
            ) !important;

          border-color:
            rgba(45, 212, 191, 0.35) !important;

          box-shadow:
            0 8px 25px rgba(45, 212, 191, 0.08);
        }

        .neurosync-assessment-page label:has(input[type="radio"]:checked) {
          background:
            linear-gradient(
              135deg,
              rgba(20, 184, 166, 0.24),
              rgba(56, 189, 248, 0.14),
              rgba(139, 92, 246, 0.17)
            ) !important;

          border-color:
            rgba(45, 212, 191, 0.72) !important;

          box-shadow:
            0 0 0 1px rgba(45, 212, 191, 0.12),
            0 12px 35px rgba(45, 212, 191, 0.12);
        }

        .neurosync-assessment-page input[type="radio"] {
          width: 18px !important;
          height: 18px !important;
          accent-color: #2dd4bf;
          flex: 0 0 auto;
        }

        /* Submit button */

        .neurosync-assessment-page button[type="submit"] {
          position: relative;
          overflow: hidden;

          min-height: 54px;
          padding: 15px 30px !important;

          border: 0 !important;
          border-radius: 16px !important;

          background:
            linear-gradient(
              105deg,
              #14b8a6 0%,
              #22d3ee 42%,
              #8b5cf6 100%
            ) !important;

          color: #ffffff !important;

          box-shadow:
            0 15px 40px rgba(20, 184, 166, 0.22),
            0 0 35px rgba(99, 102, 241, 0.12);

          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            filter 180ms ease;
        }

        .neurosync-assessment-page button[type="submit"]:hover {
          transform: translateY(-3px);
          filter: brightness(1.08);

          box-shadow:
            0 20px 50px rgba(20, 184, 166, 0.30),
            0 0 45px rgba(139, 92, 246, 0.18);
        }

        .neurosync-assessment-page button[type="submit"]::before {
          content: "";
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              115deg,
              transparent 15%,
              rgba(255,255,255,0.28) 48%,
              transparent 82%
            );

          transform: translateX(-120%);
          transition: transform 600ms ease;
        }

        .neurosync-assessment-page button[type="submit"]:hover::before {
          transform: translateX(120%);
        }

        /* Error / helper messages */

        .neurosync-assessment-page [role="alert"] {
          border-color: rgba(248, 113, 113, 0.35) !important;

          background:
            linear-gradient(
              135deg,
              rgba(127, 29, 29, 0.30),
              rgba(69, 10, 10, 0.25)
            ) !important;
        }

        @keyframes ns-assessment-float-a {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }

          to {
            transform: translate3d(90px, 55px, 0) scale(1.15);
          }
        }

        @keyframes ns-assessment-float-b {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }

          to {
            transform: translate3d(-75px, -55px, 0) scale(1.12);
          }
        }

        @media (max-width: 700px) {
          .neurosync-assessment-page header,
          .neurosync-assessment-page form > div > section {
            padding: 21px !important;
            border-radius: 20px !important;
          }

          .neurosync-assessment-page::before,
          .neurosync-assessment-page::after {
            width: 320px;
            height: 320px;
            filter: blur(80px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .neurosync-assessment-page::before,
          .neurosync-assessment-page::after {
            animation: none;
          }

          .neurosync-assessment-page form > div > section,
          .neurosync-assessment-page label,
          .neurosync-assessment-page button {
            transition: none;
          }
        }

        /* neurosync-assessment-visual-v2 */
      `}</style>

    </main>
  );
}

export default Assessment;

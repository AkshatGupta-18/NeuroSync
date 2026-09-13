import React, { useEffect, useState } from "react";
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
  const [success, setSuccess] = useState(false);

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

      setSuccess(true);
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
      >
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

  if (success) {
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
      >
        <section
          style={{
            width: "100%",
            maxWidth: "600px",
            padding: "42px",
            borderRadius: "24px",
            background: "#111113",
            border: "1px solid rgba(52,211,153,0.2)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 22px",
              borderRadius: "50%",
              background: "rgba(52,211,153,0.12)",
              color: "#34d399",
              fontSize: "30px",
            }}
          >
            ✓
          </div>

          <p
            style={{
              ...monoFont,
              color: "#34d399",
              fontSize: "12px",
              letterSpacing: "0.08em",
              marginBottom: "10px",
            }}
          >
            CHECK-IN COMPLETE
          </p>

          <h1
            style={{
              ...displayFont,
              fontSize: "32px",
              margin: "0 0 14px",
            }}
          >
            Your wellness check-in is complete
          </h1>

          <p
            style={{
              color: "#a1a1aa",
              lineHeight: 1.7,
              margin: "0 auto 28px",
              maxWidth: "480px",
            }}
          >
            Your responses were securely processed and your NeuroSync
            wellness indicators have been updated.
          </p>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={{
              border: "none",
              borderRadius: "10px",
              padding: "13px 22px",
              background: "#34d399",
              color: "#052e1b",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            View Dashboard
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
    >
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
    </main>
  );
}

export default Assessment;
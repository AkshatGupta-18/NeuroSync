import React, { useEffect } from "react";

const SECTIONS = [
  {
    id: "stress",
    title: "Stress",
    description: "How you experienced pressure and emotional strain.",
    questions: [
      {
        id: "stress_worry",
        question: "How often did you feel worried today?",
      },
      {
        id: "stress_pressure",
        question: "How often did you feel under pressure?",
      },
      {
        id: "stress_relax",
        question: "How hard was it to relax today?",
      },
      {
        id: "stress_upset",
        question: "How often did small things make you feel upset?",
      },
    ],
  },
  {
    id: "fatigue",
    title: "Fatigue",
    description:
      "Your energy, tiredness, sleep recovery, and task initiation.",
    questions: [
      {
        id: "energy_level",
        question: "How much energy did you have today?",
      },
      {
        id: "daytime_tiredness",
        question: "How tired did you feel during the day?",
      },
      {
        id: "sleep_refresh",
        question: "How fresh did you feel after sleeping?",
      },
      {
        id: "task_start",
        question: "How hard was it to get started with your tasks?",
      },
    ],
  },
  {
    id: "mental_fitness",
    title: "Mental Fitness",
    description:
      "Your mood, enjoyment, positivity, and emotional control.",
    questions: [
      {
        id: "mood",
        question: "How would you describe your mood today?",
      },
      {
        id: "enjoyment",
        question:
          "How interested were you in things you usually enjoy?",
      },
      {
        id: "positivity",
        question: "How positive did you feel today?",
      },
      {
        id: "emotional_control",
        question:
          "How well could you handle your feelings today?",
      },
    ],
  },
  {
    id: "cognitive_fitness",
    title: "Cognitive Fitness",
    description:
      "Your focus, clarity, distraction, and task completion.",
    questions: [
      {
        id: "focus",
        question: "How well could you focus today?",
      },
      {
        id: "distraction",
        question:
          "How easily did your mind get distracted?",
      },
      {
        id: "clarity",
        question: "How clearly could you think today?",
      },
      {
        id: "task_completion",
        question:
          "How well could you finish your tasks?",
      },
    ],
  },
];

const OPTION_LABELS = {
  1: "Very low",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Very good",
};

function AssessmentReview({
  assessment,
  assessmentResponses,
  responsesLoading,
  responsesError,
  onClose,
}) {
  useEffect(() => {
    if (!assessment) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [assessment, onClose]);

  if (!assessment) {
    return null;
  }

  const completedDate = assessment.completed_at
    ? new Date(assessment.completed_at)
    : new Date(assessment.created_at);

  const formattedDate = completedDate.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assessment-review-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-700/70 bg-slate-900 shadow-2xl shadow-black/40">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-800 px-5 py-5 sm:px-6">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                Read only
              </span>

              <span className="text-xs text-slate-500">
                Assessment #{assessment.id}
              </span>
            </div>

            <h2
              id="assessment-review-title"
              className="text-xl font-semibold tracking-tight text-white"
            >
              Your responses
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Responses recorded on {formattedDate}.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close response review"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/60 text-lg text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {responsesLoading && (
            <div className="flex min-h-52 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

                <p className="text-sm text-slate-400">
                  Loading your saved responses...
                </p>
              </div>
            </div>
          )}

          {!responsesLoading && responsesError && (
            <div className="flex min-h-52 items-center justify-center">
              <div className="w-full rounded-2xl border border-rose-400/20 bg-rose-400/5 px-5 py-5">
                <p className="text-sm font-medium text-rose-300">
                  Unable to load responses
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {responsesError}
                </p>
              </div>
            </div>
          )}

          {!responsesLoading &&
            !responsesError &&
            assessmentResponses && (
              <div className="space-y-5">
                {SECTIONS.map((section) => (
                  <section
                    key={section.id}
                    className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40"
                  >
                    <div className="border-b border-slate-800 px-4 py-4">
                      <h3 className="font-semibold text-white">
                        {section.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {section.description}
                      </p>
                    </div>

                    <div className="divide-y divide-slate-800/80">
                      {section.questions.map((question, index) => {
                        const answer =
                          assessmentResponses[question.id];

                        const answerLabel =
                          OPTION_LABELS[answer];

                        return (
                          <div
                            key={question.id}
                            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                          >
                            <div className="flex gap-3">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-400">
                                {index + 1}
                              </span>

                              <p className="text-sm leading-6 text-slate-300">
                                {question.question}
                              </p>
                            </div>

                            <div className="shrink-0 sm:min-w-[120px] sm:text-right">
                              {answerLabel ? (
                                <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                                  {answerLabel}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500">
                                  Not available
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default AssessmentReview;

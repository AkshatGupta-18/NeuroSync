
import { useMemo, useState } from "react";
import { analyzeMedicalReport } from "../services/medicalReports";

const TEST_EXPLANATIONS = [
  {
    pattern: /mean corpuscular.*concentration|\bmchc\b/,
    explanation:
      "Shows the average concentration of haemoglobin inside your red blood cells.",
  },
  {
    pattern: /mean corpuscular volume|\bmcv\b/,
    explanation:
      "Shows the average size of your red blood cells.",
  },
  {
    pattern: /mean corpuscular haemoglobin|mean corpuscular hemoglobin|\bmch\b/,
    explanation:
      "Shows the average amount of haemoglobin in each red blood cell.",
  },
  {
    pattern: /haemoglobin|hemoglobin|\bhb\b/,
    explanation:
      "Measures haemoglobin, the protein in red blood cells that carries oxygen around your body.",
  },
  {
    pattern: /erythrocyte count|\brbc\b/,
    explanation:
      "Counts your red blood cells, which carry oxygen throughout your body.",
  },
  {
    pattern: /packed cell volume|haematocrit|hematocrit|\bpcv\b/,
    explanation:
      "Shows what proportion of your blood is made up of red blood cells.",
  },
  {
    pattern: /red cell distribution width|\brdw\b/,
    explanation:
      "Shows how much your red blood cells differ from one another in size.",
  },
  {
    pattern: /total leucocyte|total leukocyte|white blood cell|\btlc\b|\bwbc\b/,
    explanation:
      "Counts white blood cells, which help your body fight infections.",
  },
  {
    pattern: /platelet/,
    explanation:
      "Counts platelets, which help your blood form clots and stop bleeding.",
  },
  {
    pattern: /microcytosis/,
    explanation:
      "Describes red blood cells that are smaller than usual.",
  },
  {
    pattern: /hypochromia/,
    explanation:
      "Describes red blood cells that appear paler because they contain less haemoglobin.",
  },
  {
    pattern: /anisocytosis/,
    explanation:
      "Describes variation in the sizes of red blood cells.",
  },
  {
    pattern: /poikilocytosis/,
    explanation:
      "Describes variation in the shapes of red blood cells.",
  },
  {
    pattern: /elliptocytes|pencil cells/,
    explanation:
      "Describes oval or pencil-shaped red blood cells seen under a microscope.",
  },
  {
    pattern: /target cells/,
    explanation:
      "Describes red blood cells that have a target-like appearance under a microscope.",
  },
  {
    pattern: /polychromasia/,
    explanation:
      "Describes young red blood cells that have a different colour when examined under a microscope.",
  },
  {
    pattern: /unsaturated iron.binding capacity|\buibc\b/,
    explanation:
      "Estimates how much unused iron-carrying capacity is available in your blood.",
  },
  {
    pattern: /total iron.binding capacity|\btibc\b/,
    explanation:
      "Estimates how much iron your blood can bind and carry.",
  },
  {
    pattern: /transferrin saturation|\btsat\b/,
    explanation:
      "Shows the percentage of the blood's iron-carrying protein that has iron attached.",
  },
  {
    pattern: /serum iron/,
    explanation:
      "Measures the amount of iron circulating in your blood.",
  },
  {
    pattern: /ferritin/,
    explanation:
      "Measures ferritin, a protein that stores iron in your body.",
  },
  {
    pattern: /soluble transferrin receptor|\bstfr\b/,
    explanation:
      "Measures a protein receptor involved in how cells take in iron.",
  },
  {
    pattern: /c.reactive protein|\bcrp\b/,
    explanation:
      "Measures a protein that can increase when inflammation is present in the body.",
  },
  {
    pattern: /erythrocyte sedimentation rate|\besr\b/,
    explanation:
      "Measures how quickly red blood cells settle in a tube. It is sometimes used as a general marker of inflammation.",
  },
  {
    pattern: /vitamin b12|\bb12\b/,
    explanation:
      "Measures vitamin B12, which helps maintain healthy blood cells and normal nerve function.",
  },
  {
    pattern: /folate/,
    explanation:
      "Measures folate, a vitamin needed for making healthy blood cells.",
  },
  {
    pattern: /reticulocyte haemoglobin|reticulocyte hemoglobin|ret-he/,
    explanation:
      "Estimates how much haemoglobin is available in newly produced red blood cells.",
  },
  {
    pattern: /reticulocyte count/,
    explanation:
      "Counts young red blood cells that have recently been released from your bone marrow.",
  },
];

const STATUS_META = {
  normal: {
    label: "Within range",
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  },
  low: {
    label: "Below range",
    className: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  },
  high: {
    label: "Above range",
    className: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  },
  abnormal: {
    label: "Flagged finding",
    className: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  },
  unknown: {
    label: "Needs review",
    className: "border-slate-500/30 bg-slate-700/50 text-slate-300",
  },
};

const FILTER_LABELS = [
  { value: "all", label: "All results" },
  { value: "normal", label: "Within range" },
  { value: "low", label: "Below range" },
  { value: "high", label: "Above range" },
  { value: "review", label: "Needs review" },
];

function getNormalizedStatus(status) {
  return String(status || "unknown").toLowerCase();
}

function getStatusMeta(status) {
  return (
    STATUS_META[getNormalizedStatus(status)] ||
    STATUS_META.unknown
  );
}

function getTestExplanation(measurement) {
  const name = [
    measurement.normalized_name || "",
    measurement.analyte_name || "",
  ]
    .join(" ")
    .toLowerCase();

  const match = TEST_EXPLANATIONS.find((item) =>
    item.pattern.test(name)
  );

  return (
    match?.explanation ||
    "This test is included in your medical report. Its result has been preserved, but a simple explanation is not available yet."
  );
}

function getResultExplanation(status) {
  switch (getNormalizedStatus(status)) {
    case "normal":
      return "This result is within the reference range printed on your report.";

    case "low":
      return "This result is below the reference range printed on your report.";

    case "high":
      return "This result is above the reference range printed on your report.";

    case "abnormal":
      return "The report flags this finding as different from its expected description. Review the original report with a healthcare professional.";

    default:
      return "An automatic comparison was not possible. Check the original report for context and discuss the finding with your healthcare professional if needed.";
  }
}

function formatResultValue(measurement) {
  const value = measurement.value;

  if (value !== null && value !== undefined && value !== "") {
    const numericValue = Number(value);

    if (Number.isFinite(numericValue)) {
      return numericValue.toLocaleString("en-IN", {
        maximumFractionDigits: 4,
      });
    }

    return String(value);
  }

  return measurement.qualitative_value || "Not available";
}

function getMeasurementGroup(status) {
  const normalized = getNormalizedStatus(status);

  if (normalized === "normal") return "normal";
  if (normalized === "low") return "low";
  if (normalized === "high") return "high";

  return "review";
}

function MedicalReportAnalysis({ report }) {
  const [measurements, setMeasurements] = useState(
    Array.isArray(report.measurements) ? report.measurements : []
  );

  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [expanded, setExpanded] = useState(
    report.processing_status === "completed"
  );

  const [hasAnalyzed, setHasAnalyzed] = useState(
    report.processing_status === "completed"
  );

  const [activeFilter, setActiveFilter] = useState("all");

  const isPdf = report.original_filename
    ?.toLowerCase()
    .endsWith(".pdf");

  const summary = useMemo(() => {
    return measurements.reduce(
      (counts, measurement) => {
        const group = getMeasurementGroup(measurement.status);
        counts[group] += 1;
        return counts;
      },
      {
        normal: 0,
        low: 0,
        high: 0,
        review: 0,
      }
    );
  }, [measurements]);

  const filteredMeasurements = useMemo(() => {
    if (activeFilter === "all") {
      return measurements;
    }

    return measurements.filter(
      (measurement) =>
        getMeasurementGroup(measurement.status) === activeFilter
    );
  }, [measurements, activeFilter]);

  const summaryCards = [
    {
      key: "normal",
      label: "Within range",
      count: summary.normal,
      description: "Matches the lab's stated range",
      className: "border-emerald-400/20 bg-emerald-400/5",
      valueClass: "text-emerald-300",
    },
    {
      key: "low",
      label: "Below range",
      count: summary.low,
      description: "Below the lab's stated range",
      className: "border-amber-400/20 bg-amber-400/5",
      valueClass: "text-amber-300",
    },
    {
      key: "high",
      label: "Above range",
      count: summary.high,
      description: "Above the lab's stated range",
      className: "border-amber-400/20 bg-amber-400/5",
      valueClass: "text-amber-300",
    },
    {
      key: "review",
      label: "Needs review",
      count: summary.review,
      description: "Flagged or unclassified findings",
      className: "border-slate-500/30 bg-slate-700/20",
      valueClass: "text-slate-200",
    },
  ];

  const filterCounts = {
    all: measurements.length,
    ...summary,
  };

  async function handleAnalyze() {
    setLoading(true);
    setError("");
    setWarnings([]);

    try {
      const result = await analyzeMedicalReport(report.id);

      setMeasurements(
        Array.isArray(result.measurements) ? result.measurements : []
      );

      setWarnings(
        Array.isArray(result.warnings) ? result.warnings : []
      );

      setHasAnalyzed(true);
      setExpanded(true);
      setActiveFilter("all");
    } catch (err) {
      setError(
        err.message || "Unable to analyze this medical report."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!isPdf) {
    return (
      <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
        <p className="text-sm font-medium text-slate-300">
          Automatic analysis is not available for this file yet.
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Preview and download are available. Automatic text extraction
          currently supports text-based PDF reports only. Image OCR is
          not enabled yet.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">

      {/* Analysis Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-lg text-emerald-300">
            ✦
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Report insights
            </p>

            <h4 className="mt-1 text-lg font-semibold text-slate-100">
              Understand your results
            </h4>

            <p className="mt-1 max-w-xl text-sm leading-5 text-slate-400">
              Simple explanations of the tests and results found in your report.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {measurements.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((previous) => !previous)}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5"
            >
              {expanded ? "Hide results" : "View results"}
            </button>
          )}

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="rounded-lg bg-emerald-400 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Analyzing report..."
              : hasAnalyzed
                ? "Re-analyze report"
                : "Analyze report"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mx-5 mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 sm:mx-6"
        >
          {error}
        </div>
      )}

      {/* Initial State */}
      {!hasAnalyzed && measurements.length === 0 && !loading && (
        <div className="p-6 sm:p-8">
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
            <p className="text-base font-medium text-slate-200">
              Your results are waiting to be extracted
            </p>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">
              Select Analyze report to extract the test names, values,
              units and reference ranges from this PDF. We will also
              explain common test names in simple language.
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && measurements.length === 0 && (
        <div
          className="p-8 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-slate-200">
            Reading your report...
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Extracting test names and results. Please wait.
          </p>
        </div>
      )}

      {/* Analysis Results */}
      {expanded && measurements.length > 0 && (
        <div className="p-5 sm:p-6">

          {/* Summary */}
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h5 className="text-base font-semibold text-slate-100">
                Your report at a glance
              </h5>

              <p className="mt-1 text-xs text-slate-500">
                {measurements.length} results extracted from this document.
              </p>
            </div>

            <p className="text-xs text-slate-500">
              Compared with ranges printed in your report
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.key}
                className={`rounded-xl border p-4 ${card.className}`}
              >
                <p className="text-xs font-medium text-slate-400">
                  {card.label}
                </p>

                <p className={`mt-2 text-3xl font-semibold tabular-nums ${card.valueClass}`}>
                  {card.count}
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mt-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h5 className="text-sm font-semibold text-slate-200">
                Explore individual results
              </h5>

              <span className="text-xs text-slate-500">
                {filteredMeasurements.length} shown
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {FILTER_LABELS.map((item) => {
                const selected = activeFilter === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setActiveFilter(item.value)}
                    aria-pressed={selected}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                      selected
                        ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                        : "border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    {item.label}
                    <span className="ml-2 opacity-70">
                      {filterCounts[item.value]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Individual Result Cards */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredMeasurements.map((measurement) => {
              const status = getStatusMeta(measurement.status);

              return (
                <article
                  key={measurement.id}
                  className="rounded-xl border border-white/10 bg-slate-900/80 p-4 transition hover:border-white/20 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Test name
                      </p>

                      <h6 className="mt-1 text-sm font-semibold leading-6 text-slate-100">
                        {measurement.analyte_name || "Unnamed test"}
                      </h6>
                    </div>

                    <span
                      className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Value */}
                  <div className="mt-5 flex flex-wrap items-end gap-2">
                    <p className="text-3xl font-semibold tracking-tight text-white tabular-nums">
                      {formatResultValue(measurement)}
                    </p>

                    {measurement.unit && (
                      <p className="mb-1 text-sm text-slate-400">
                        {measurement.unit}
                      </p>
                    )}
                  </div>

                  {/* Reference Range */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-950/80 px-3 py-2.5">
                    <span className="text-xs text-slate-500">
                      Lab reference range
                    </span>

                    <span className="text-xs font-medium text-slate-300">
                      {measurement.reference_range_text || "Not provided"}
                    </span>
                  </div>

                  {/* Plain Language Explanation */}
                  <div className="mt-4 space-y-3">
                    <div className="rounded-lg border border-white/5 bg-white/[0.025] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                        What is this test?
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {getTestExplanation(measurement)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-white/5 bg-white/[0.025] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        What does your result show?
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {getResultExplanation(measurement.status)}
                      </p>
                    </div>
                  </div>

                  {measurement.page_number && (
                    <p className="mt-3 text-[10px] text-slate-600">
                      Extracted from page {measurement.page_number}
                    </p>
                  )}
                </article>
              );
            })}
          </div>

          {filteredMeasurements.length === 0 && (
            <div className="mt-4 rounded-xl border border-dashed border-white/10 p-6 text-center">
              <p className="text-sm text-slate-400">
                No results are available in this category.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Completed Without Measurements */}
      {hasAnalyzed && measurements.length === 0 && !loading && (
        <div className="p-6">
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-5">
            <p className="text-sm font-semibold text-amber-300">
              No supported measurements were extracted
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              The document was processed, but no supported test results
              were identified. Please review the original report.
            </p>
          </div>
        </div>
      )}

      {/* Extraction Warnings */}
      {warnings.length > 0 && (
        <div className="mx-5 mb-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 sm:mx-6">
          <p className="text-sm font-semibold text-amber-300">
            Some results need attention
          </p>

          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-amber-200/80">
            {warnings.map((warning, index) => (
              <li key={`${index}-${warning}`}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Medical Safety Notice */}
      <div className="border-t border-white/10 bg-slate-900/50 px-5 py-4 sm:px-6">
        <p className="text-xs leading-5 text-slate-500">
          <span className="font-semibold text-slate-400">
            Important:
          </span>{" "}
          These explanations describe what common tests measure and
          compare extracted values with information printed in your
          report. They are not a diagnosis or medical advice. Always
          verify extracted results against the original document and
          discuss health concerns with a qualified healthcare professional.
        </p>
      </div>
    </section>
  );
}

export default MedicalReportAnalysis;

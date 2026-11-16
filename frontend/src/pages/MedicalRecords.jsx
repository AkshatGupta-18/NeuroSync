
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  listMedicalReports,
  uploadMedicalReport,
  deleteMedicalReport,
  getMedicalReportFile,
} from "../services/medicalReports";

import MedicalReportAnalysis from "../components/MedicalReportAnalysis";

const CATEGORIES = [
  { value: "all", label: "All records" },
  { value: "blood_test", label: "Blood tests" },
  { value: "urine_test", label: "Urine tests" },
  { value: "imaging", label: "Imaging" },
  { value: "prescription", label: "Prescriptions" },
  { value: "other", label: "Other" },
];

const MAX_FILE_SIZE = 15 * 1024 * 1024;

function getReportsArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB"];

  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(bytes / Math.pow(1024, index)).toFixed(
    index === 0 ? 0 : 2
  )} ${units[index]}`;
}

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getCategoryLabel(value) {
  return (
    CATEGORIES.find((category) => category.value === value)?.label ||
    "Other"
  );
}

function MedicalRecords() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [selectedCategory, setSelectedCategory] = useState("other");
  const [selectedFile, setSelectedFile] = useState(null);

  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  // Load the authenticated user's medical records.
  useEffect(() => {
    let active = true;

    async function loadReports() {
      try {
        const data = await listMedicalReports();

        if (active) {
          setReports(getReportsArray(data));
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || "Unable to load your medical records."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      active = false;
    };
  }, []);

  // Clean up preview object URLs.
  useEffect(() => {
    return () => {
      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  async function refreshReports() {
    try {
      const data = await listMedicalReports();
      setReports(getReportsArray(data));
    } catch (err) {
      setError(
        err.message || "Unable to refresh your medical records."
      );
    }
  }

  // Search and category filtering.
  const filteredReports = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesCategory =
        category === "all" || report.category === category;

      const matchesSearch =
        !searchTerm ||
        report.title?.toLowerCase().includes(searchTerm) ||
        report.original_filename?.toLowerCase().includes(searchTerm);

      return matchesCategory && matchesSearch;
    });
  }, [reports, search, category]);

  // Upload a new medical document.
  async function handleUpload(event) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select a medical document first.");
      return;
    }

    if (selectedFile.size <= 0) {
      setError("The selected file is empty.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size must not exceed 15 MB.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      await uploadMedicalReport(selectedFile, selectedCategory);

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSuccess("Medical record uploaded successfully.");

      await refreshReports();
    } catch (err) {
      setError(
        err.message || "Unable to upload your medical record."
      );
    } finally {
      setUploading(false);
    }
  }

  // Preview a document using its authenticated API endpoint.
  async function handlePreview(report) {
    setPreviewLoading(true);
    setError("");

    try {
      const blob = await getMedicalReportFile(report.id, "preview");
      const objectUrl = URL.createObjectURL(blob);

      setPreview({
        id: report.id,
        title: report.title,
        filename: report.original_filename,
        url: objectUrl,
        type: blob.type,
      });
    } catch (err) {
      setError(
        err.message || "Unable to preview this medical document."
      );
    } finally {
      setPreviewLoading(false);
    }
  }

  // Download a document using its authenticated API endpoint.
  async function handleDownload(report) {
    setError("");

    try {
      const blob = await getMedicalReportFile(report.id, "download");
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = report.original_filename || "medical-report";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 1000);
    } catch (err) {
      setError(
        err.message || "Unable to download this medical document."
      );
    }
  }

  // Delete a document after explicit confirmation.
  async function handleDelete(report) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${report.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(report.id);
    setError("");
    setSuccess("");

    try {
      await deleteMedicalReport(report.id);

      setReports((previousReports) =>
        previousReports.filter((item) => item.id !== report.id)
      );

      if (preview?.id === report.id) {
        setPreview(null);
      }

      setSuccess("Medical record deleted successfully.");
    } catch (err) {
      setError(
        err.message || "Unable to delete this medical record."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // Validate the selected file before upload.
  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;

    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.size <= 0) {
      setSelectedFile(null);
      setError("The selected file is empty.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setError("File size must not exceed 15 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  }

  const isPdf = preview?.type === "application/pdf";
  const isImage = preview?.type?.startsWith("image/");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Page Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mb-3 text-sm text-slate-400 transition hover:text-emerald-300"
            >
              ← Back to dashboard
            </button>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Medical records
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Your private health document library.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3">
            <p className="text-xs text-slate-500">Stored records</p>

            <p className="mt-1 text-xl font-semibold text-emerald-300">
              {reports.length}
            </p>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="text-rose-300 hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          >
            {success}
          </div>
        )}

        {/* Upload Section */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              Upload a medical record
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Upload laboratory reports, prescriptions or medical documents.
            </p>
          </div>

          <form onSubmit={handleUpload}>
            <div className="grid gap-4 sm:grid-cols-2">

              {/* File Input */}
              <div>
                <label
                  htmlFor="medical-file"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Select document
                </label>

                <input
                  ref={fileInputRef}
                  id="medical-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="block w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-400/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-emerald-300"
                />

                <p className="mt-2 text-xs text-slate-500">
                  PDF, JPG, JPEG or PNG. Maximum size: 15 MB.
                </p>
              </div>

              {/* Category Selector */}
              <div>
                <label
                  htmlFor="medical-category"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Document category
                </label>

                <select
                  id="medical-category"
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(event.target.value)
                  }
                  disabled={uploading}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-slate-200 outline-none focus:border-emerald-400/50"
                >
                  {CATEGORIES.filter(
                    (item) => item.value !== "all"
                  ).map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected File Information */}
            {selectedFile && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {selectedFile.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  disabled={uploading}
                  className="text-sm text-slate-400 hover:text-rose-300 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Upload Button */}
            <div className="mt-5">
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload medical record"}
              </button>
            </div>
          </form>
        </section>

        {/* Documents Section */}
        <section>
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-lg font-semibold">
                Your documents
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Search, preview, download, analyze or remove your uploaded records.
              </p>
            </div>

            {/* Search and Category Filter */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search records..."
                aria-label="Search medical records"
                className="min-w-0 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-emerald-400/50 sm:w-56"
              />

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                aria-label="Filter by category"
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-emerald-400/50"
              >
                {CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900 px-6 py-14 text-center">
              <p className="text-sm text-slate-400">
                Loading your medical records...
              </p>
            </div>
          ) : filteredReports.length === 0 ? (

            /* Empty State */
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/50 px-6 py-14 text-center">
              <h3 className="text-base font-medium text-slate-200">
                {reports.length === 0
                  ? "No medical records yet"
                  : "No matching records"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {reports.length === 0
                  ? "Upload your first medical document to start building your private health library."
                  : "Try changing your search term or category filter."}
              </p>
            </div>
          ) : (

            /* Medical Records List */
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <article
                  key={report.id}
                  className="rounded-2xl border border-white/10 bg-slate-900 p-4 sm:p-5"
                >

                  {/* Document Header and Actions */}
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                    {/* Document Information */}
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-xs font-bold text-emerald-300">
                        {report.original_filename
                          ?.split(".")
                          .pop()
                          ?.toUpperCase() || "FILE"}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-100">
                          {report.title}
                        </h3>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {report.original_filename}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span>
                            {getCategoryLabel(report.category)}
                          </span>

                          <span>
                            {formatFileSize(report.file_size)}
                          </span>

                          <span>
                            {formatDate(report.created_at)}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                          Processing status:{" "}
                          <span className="text-slate-300">
                            {report.processing_status || "Uploaded"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Document Actions */}
                    <div className="flex flex-wrap gap-2 sm:shrink-0">
                      <button
                        type="button"
                        onClick={() => handlePreview(report)}
                        disabled={previewLoading}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                      >
                        Preview
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(report)}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5"
                      >
                        Download
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(report)}
                        disabled={deletingId === report.id}
                        className="rounded-lg border border-rose-500/20 px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-50"
                      >
                        {deletingId === report.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>

                  {/* Full-Width Report Analysis */}
                  <MedicalReportAnalysis report={report} />

                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Document Preview Modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Medical document preview"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPreview(null);
            }
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900">

            {/* Preview Header */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-slate-100">
                  {preview.title}
                </h2>

                <p className="mt-1 truncate text-xs text-slate-500">
                  {preview.filename}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreview(null)}
                aria-label="Close preview"
                className="shrink-0 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
              >
                Close
              </button>
            </div>

            {/* Preview Content */}
            <div className="min-h-[55vh] flex-1 overflow-auto bg-slate-950 p-2 sm:p-4">
              {isPdf ? (
                <iframe
                  title={`Preview of ${preview.filename}`}
                  src={preview.url}
                  className="h-[70vh] w-full rounded-lg bg-white"
                />
              ) : isImage ? (
                <img
                  src={preview.url}
                  alt={`Preview of ${preview.filename}`}
                  className="mx-auto max-h-[70vh] max-w-full rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-full min-h-[40vh] items-center justify-center text-sm text-slate-400">
                  Preview is not available for this file type. Please download it.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedicalRecords;

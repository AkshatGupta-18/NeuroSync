import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import useDashboardData from "../hooks/useDashboardData";
import { clearTokens } from "../services/auth";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { SCAN_SECONDS, extractRgb, calculateBpm, wavePath } from "../lib/heartRate";

const displayFont = { fontFamily: "'Space Grotesk', sans-serif" };
const monoFont = { fontFamily: "'IBM Plex Mono', monospace" };

/* ---------- face detection config ---------- */

// IMPORTANT: keep this identical to the installed package version.
// Run: npm i @mediapipe/tasks-vision@0.10.14
const MEDIAPIPE_VERSION = "0.10.14";
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_URL =
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

// The guide oval: height as a share of the preview height, and width / height.
// The on-screen oval AND the position check both use these, so they always agree.
const OVAL_HEIGHT_RATIO = 0.72;
const OVAL_ASPECT = 0.76;

// How strict the alignment is (share of the oval's half-size).
const MAX_OFFSET_X = 0.22;
const MAX_OFFSET_Y = 0.2;
const MIN_SIZE = 0.62; // face height / oval height, below this = too far
const MAX_SIZE = 0.95; // above this = too close

/* ---------- local icons (no dependency on DashboardIcons) ---------- */

const iconProps = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
};

const IconHeart = (props) => (
    <svg {...iconProps} {...props}>
        <path d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.6 4.5 6.8 4.5c2 0 3.5 1 5.2 3 1.7-2 3.2-3 5.2-3 3.2 0 5.4 3.1 4.1 6.6-1.8 4.8-9.3 9.4-9.3 9.4z" />
    </svg>
);

const IconCam = (props) => (
    <svg {...iconProps} {...props}>
        <path d="M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
        <path d="M15 10.5l5.2-3a.6.6 0 0 1 .8.5v8a.6.6 0 0 1-.8.5l-5.2-3" />
    </svg>
);

const IconStop = (props) => (
    <svg {...iconProps} {...props}>
        <rect x="6" y="6" width="12" height="12" rx="2.5" />
    </svg>
);

const IconSun = (props) => (
    <svg {...iconProps} {...props}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
);

const IconFace = (props) => (
    <svg {...iconProps} {...props}>
        <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
        <path d="M9 10v1M15 10v1M9.5 15c.7.7 1.5 1 2.5 1s1.8-.3 2.5-1" />
    </svg>
);

const IconStill = (props) => (
    <svg {...iconProps} {...props}>
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const IconShield = (props) => (
    <svg {...iconProps} {...props}>
        <path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

const IconAlertTri = (props) => (
    <svg {...iconProps} {...props}>
        <path d="M12 3.5l9.5 16.5h-19L12 3.5z" />
        <path d="M12 10v4M12 17v.5" />
    </svg>
);

const IconCheck = (props) => (
    <svg {...iconProps} {...props}>
        <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
);

/* ---------- static content ---------- */

const tips = [
    {
        icon: IconSun,
        title: "Face a soft light",
        body: "Even, front-facing light gives the cleanest colour signal. Avoid strong backlight.",
        tone: "amber",
    },
    {
        icon: IconFace,
        title: "Centre your face",
        body: "Keep your whole face inside the guide, forehead and cheeks visible.",
        tone: "emerald",
    },
    {
        icon: IconStill,
        title: "Stay still",
        body: "Hold steady and breathe normally for the whole scan. Movement adds noise.",
        tone: "violet",
    },
];

const toneClasses = {
    amber: "bg-amber-400/10 text-amber-300 border-amber-400/20",
    emerald: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    violet: "bg-violet-400/10 text-violet-300 border-violet-400/20",
};

/* ---------- live guidance model ---------- */

const NO_CHECKS = { found: false, centered: false, distance: false };

const GUIDES = {
    loading: {
        key: "loading",
        tone: "slate",
        message: "Loading face detection…",
        hint: "This only takes a few seconds the first time.",
        checks: NO_CHECKS,
    },
    searching: {
        key: "searching",
        tone: "slate",
        message: "Looking for your face…",
        hint: "Face the camera and keep your face in the frame.",
        checks: NO_CHECKS,
    },
    noFace: {
        key: "no-face",
        tone: "amber",
        message: "No face detected",
        hint: "Look at the camera and move into the frame.",
        checks: NO_CHECKS,
    },
    outOfFrame: {
        key: "out-of-frame",
        tone: "amber",
        message: "Keep your whole face in view",
        hint: "Part of your face is outside the camera frame.",
        checks: { found: true, centered: false, distance: false },
    },
    tooFar: {
        key: "too-far",
        tone: "amber",
        message: "Move closer",
        hint: "Fill the oval with your face.",
        checks: { found: true, centered: true, distance: false },
    },
    tooClose: {
        key: "too-close",
        tone: "amber",
        message: "Move back a little",
        hint: "Your face is larger than the oval.",
        checks: { found: true, centered: true, distance: false },
    },
    moveLeft: {
        key: "move-left",
        tone: "amber",
        message: "Move left",
        hint: "Centre your face inside the oval.",
        checks: { found: true, centered: false, distance: true },
    },
    moveRight: {
        key: "move-right",
        tone: "amber",
        message: "Move right",
        hint: "Centre your face inside the oval.",
        checks: { found: true, centered: false, distance: true },
    },
    moveUp: {
        key: "move-up",
        tone: "amber",
        message: "Move up",
        hint: "Your face is sitting too low in the oval.",
        checks: { found: true, centered: false, distance: true },
    },
    moveDown: {
        key: "move-down",
        tone: "amber",
        message: "Move down",
        hint: "Your face is sitting too high in the oval.",
        checks: { found: true, centered: false, distance: true },
    },
    ready: {
        key: "ready",
        tone: "emerald",
        message: "Perfect, hold still",
        hint: "Your face is aligned and ready to scan.",
        checks: { found: true, centered: true, distance: true },
    },
};

// Maps a normalised landmark (0..1 in the video) to pixels inside the preview box,
// accounting for object-cover cropping and the mirrored display.
function makeProjector(video, boxW, boxH) {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const scale = Math.max(boxW / vw, boxH / vh);
    const offX = (boxW - vw * scale) / 2;
    const offY = (boxH - vh * scale) / 2;

    return (p) => [
        boxW - (p.x * vw * scale + offX), // mirrored horizontally
        p.y * vh * scale + offY,
    ];
}

// Turns the detected landmarks into one of the guidance states above.
function evaluateFace(landmarks, project, boxW, boxH) {
    if (!landmarks) return GUIDES.noFace;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const p of landmarks) {
        const [x, y] = project(p);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }

    const margin = 4;
    if (
        minX < margin ||
        minY < margin ||
        maxX > boxW - margin ||
        maxY > boxH - margin
    ) {
        return GUIDES.outOfFrame;
    }

    const ovalH = boxH * OVAL_HEIGHT_RATIO;
    const ovalW = ovalH * OVAL_ASPECT;

    const dx = ((minX + maxX) / 2 - boxW / 2) / (ovalW / 2);
    const dy = ((minY + maxY) / 2 - boxH / 2) / (ovalH / 2);
    const size = (maxY - minY) / ovalH;

    if (size < MIN_SIZE) return GUIDES.tooFar;
    if (size > MAX_SIZE) return GUIDES.tooClose;

    // The preview is mirrored, so "left" matches what the user sees on screen.
    if (dx > MAX_OFFSET_X) return GUIDES.moveLeft;
    if (dx < -MAX_OFFSET_X) return GUIDES.moveRight;
    if (dy > MAX_OFFSET_Y) return GUIDES.moveUp;
    if (dy < -MAX_OFFSET_Y) return GUIDES.moveDown;

    return GUIDES.ready;
}

const toneStyles = {
    slate: {
        oval: "border-slate-400/50 border-dashed",
        corner: "border-slate-400/60",
        pill: "border-slate-600/60 bg-slate-900/80 text-slate-200",
        icon: "text-slate-300",
        stroke: "rgba(148,163,184,0.7)",
    },
    amber: {
        oval: "border-amber-400/90 border-dashed",
        corner: "border-amber-400/90",
        pill: "border-amber-400/40 bg-amber-950/70 text-amber-100",
        icon: "text-amber-300",
        stroke: "rgba(251,191,36,0.9)",
    },
    emerald: {
        oval: "border-emerald-400 border-solid shadow-[0_0_40px_6px_rgba(52,211,153,0.35)]",
        corner: "border-emerald-400",
        pill: "border-emerald-400/50 bg-emerald-950/70 text-emerald-100",
        icon: "text-emerald-300",
        stroke: "rgba(52,211,153,0.95)",
    },
};

function describeError(err) {
    switch (err?.name) {
        case "NotAllowedError":
        case "PermissionDeniedError":
            return "Camera permission was blocked. Allow camera access in your browser's address bar and try again.";
        case "NotFoundError":
        case "DevicesNotFoundError":
            return "No camera was found on this device.";
        case "NotReadableError":
        case "TrackStartError":
            return "Your camera is being used by another app. Close it and try again.";
        case "OverconstrainedError":
            return "This camera doesn't support the requested settings.";
        case "SecurityError":
            return "Camera access needs a secure connection (https or localhost).";
        default:
            return "Couldn't start the camera. Please try again.";
    }
}

/* ---------- heart-rate scan state ---------- */

const IDLE_SCAN = {
    phase: "idle", // idle | measuring | done
    progress: 0,
    bpm: null,
    quality: null, // good | fair | poor
    confidence: 0,
    wave: [],
    fps: 0, // how many colour samples per second we are really getting
    notice: "",
};

const qualityTone = {
    good: "text-emerald-300",
    fair: "text-amber-300",
    poor: "text-rose-300",
};

// While scanning, the (slow) face detector may block the page for at most
// ~1/4 of the time, so colour sampling can keep up with the camera.
const SCAN_DETECT_MIN_GAP_MS = 300;
const SCAN_DETECT_BUSY_FACTOR = 4;
const LANDMARK_SMOOTHING = 0.5; // 0 = frozen, 1 = no smoothing
const LANDMARK_MAX_AGE_MS = 1500; // landmarks older than this count as "face lost"
const LOW_FPS_WARNING = 15;

/* ---------- page ---------- */

function Scans() {
    const navigate = useNavigate();
    const { user } = useDashboardData();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [status, setStatus] = useState("idle"); // idle | starting | live | error
    const [error, setError] = useState("");
    const [camInfo, setCamInfo] = useState(null);

    const landmarkerRef = useRef(null);
    const animationRef = useRef(null);

    const [detectorReady, setDetectorReady] = useState(false);
    const [detectorError, setDetectorError] = useState("");
    const [guide, setGuide] = useState(GUIDES.searching);

    // heart-rate scan
    const scanningRef = useRef(false);
    const samplesRef = useRef([]);
    const lastGoodRef = useRef(0);
    const lastUiRef = useRef(0);
    const latestFaceRef = useRef(null); // { landmarks, usable, t } shared by detector -> sampler
    const [scan, setScan] = useState(IDLE_SCAN);

    const startScan = () => {
        samplesRef.current = [];
        lastGoodRef.current = performance.now();
        lastUiRef.current = 0;
        scanningRef.current = true;
        setScan({ ...IDLE_SCAN, phase: "measuring" });
    };

    const cancelScan = () => {
        scanningRef.current = false;
        samplesRef.current = [];
        setScan(IDLE_SCAN);
    };

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }, []);

    const userInitial =
        user?.first_name?.charAt(0)?.toUpperCase() ||
        user?.username?.charAt(0)?.toUpperCase() ||
        "U";

    const stopWebcam = useCallback(() => {
        // a scan can't continue without the camera
        scanningRef.current = false;
        samplesRef.current = [];
        latestFaceRef.current = null;
        setScan(IDLE_SCAN);

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCamInfo(null);
        setStatus("idle");
    }, []);

    const handleLogout = () => {
        stopWebcam();
        clearTokens();
        setSidebarOpen(false);
        navigate("/login", { replace: true });
    };

    const openWebcam = useCallback(async () => {
        if (status === "starting" || status === "live") return;

        setError("");

        if (!navigator.mediaDevices?.getUserMedia) {
            setError(
                "This browser can't access the camera. Use a recent browser over https or localhost."
            );
            setStatus("error");
            return;
        }

        setStatus("starting");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 },
                },
                audio: false,
            });

            streamRef.current = stream;

            const video = videoRef.current;
            if (video) {
                video.srcObject = stream;
                await video.play().catch(() => { });
            }

            const track = stream.getVideoTracks()[0];
            const settings = track?.getSettings?.() || {};
            setCamInfo({
                label: track?.label || "Webcam",
                width: settings.width,
                height: settings.height,
                fps: settings.frameRate ? Math.round(settings.frameRate) : null,
            });

            // if the user unplugs the camera or revokes permission mid-scan
            track?.addEventListener("ended", () => {
                stopWebcam();
                setError("The camera was disconnected.");
                setStatus("error");
            });

            setStatus("live");
        } catch (err) {
            setError(describeError(err));
            setStatus("error");
        }
    }, [status, stopWebcam]);

    // release the camera when leaving the page
    useEffect(() => {
        return () => {
            scanningRef.current = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    // load the face landmarker once (GPU first, CPU fallback)
    useEffect(() => {
        let cancelled = false;
        let landmarker = null;

        async function initializeFaceDetector() {
            try {
                const vision = await FilesetResolver.forVisionTasks(WASM_URL);

                const create = (delegate) =>
                    FaceLandmarker.createFromOptions(vision, {
                        baseOptions: { modelAssetPath: MODEL_URL, delegate },
                        runningMode: "VIDEO",
                        numFaces: 1,
                    });

                try {
                    landmarker = await create("GPU");
                } catch (gpuErr) {
                    console.warn("GPU delegate unavailable, using CPU:", gpuErr);
                    landmarker = await create("CPU");
                }

                if (cancelled) {
                    landmarker.close();
                    return;
                }

                landmarkerRef.current = landmarker;
                setDetectorReady(true);
            } catch (err) {
                console.error("Face detector initialization failed:", err);
                if (!cancelled) {
                    setDetectorError(
                        "Couldn't load face detection. Check your internet connection and that @mediapipe/tasks-vision matches the version set in this file."
                    );
                }
            }
        }

        initializeFaceDetector();

        return () => {
            cancelled = true;
            landmarker?.close();
            landmarkerRef.current = null;
            setDetectorReady(false);
        };
    }, []);

    // Two decoupled loops:
    //  A) face detection + guidance  (slow: runs the landmarker, throttled while scanning)
    //  B) colour sampling            (fast: once per camera frame, only reads a few small patches)
    useEffect(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        const clearCanvas = () => {
            const ctx = canvas?.getContext("2d");
            if (ctx && canvas) {
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };

        if (status !== "live" || !detectorReady || !video) {
            clearCanvas();
            return undefined;
        }

        setGuide(GUIDES.searching);
        latestFaceRef.current = null;

        let lastVideoTime = -1;
        let lastDetectionTime = 0;
        let lastDetectMs = 100; // how long the last landmarker call took
        let smoothed = null; // smoothed landmarks (reduces patch jitter)
        // a guidance message must hold for a few checks before it is shown (avoids flicker)
        const pending = { key: null, count: 0 };

        /* ---------- A) face detection + guidance ---------- */
        const detectFace = () => {
            animationRef.current = requestAnimationFrame(detectFace);

            const landmarker = landmarkerRef.current;

            if (!landmarker || video.readyState < 2 || !video.videoWidth) {
                return;
            }

            const now = performance.now();

            // Normally ~10 detections/second. While scanning, detect less often so the
            // page stays free to sample EVERY camera frame (the pulse needs ~30 samples/s).
            const minGap = scanningRef.current
                ? Math.max(SCAN_DETECT_MIN_GAP_MS, lastDetectMs * SCAN_DETECT_BUSY_FACTOR)
                : 100;

            if (video.currentTime === lastVideoTime || now - lastDetectionTime < minGap) {
                return;
            }

            lastVideoTime = video.currentTime;
            lastDetectionTime = now;

            const boxW = video.clientWidth;
            const boxH = video.clientHeight;
            if (!boxW || !boxH) return;

            try {
                const t0 = performance.now();
                const result = landmarker.detectForVideo(video, now);
                lastDetectMs = performance.now() - t0;

                const landmarks = result.faceLandmarks?.[0] || null;
                const project = makeProjector(video, boxW, boxH);

                const next = evaluateFace(landmarks, project, boxW, boxH);

                if (pending.key === next.key) {
                    pending.count += 1;
                } else {
                    pending.key = next.key;
                    pending.count = 1;
                }

                if (pending.count >= 3) {
                    setGuide((prev) => (prev.key === next.key ? prev : next));
                }

                // hand the latest face to the sampler (smoothed so the skin patches don't jitter)
                const usable = !!landmarks && next.checks.found && next.key !== "out-of-frame";
                if (usable) {
                    const k = LANDMARK_SMOOTHING;
                    smoothed =
                        smoothed && smoothed.length === landmarks.length
                            ? landmarks.map((p, i) => ({
                                x: smoothed[i].x * (1 - k) + p.x * k,
                                y: smoothed[i].y * (1 - k) + p.y * k,
                            }))
                            : landmarks.map((p) => ({ x: p.x, y: p.y }));
                } else {
                    smoothed = null;
                }
                latestFaceRef.current = {
                    landmarks: smoothed,
                    usable,
                    t: performance.now(),
                };

                // draw the face contour so the user can see it being tracked
                const ctx = canvas?.getContext("2d");
                if (ctx && canvas) {
                    const dpr = window.devicePixelRatio || 1;
                    if (
                        canvas.width !== Math.round(boxW * dpr) ||
                        canvas.height !== Math.round(boxH * dpr)
                    ) {
                        canvas.width = Math.round(boxW * dpr);
                        canvas.height = Math.round(boxH * dpr);
                    }

                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                    ctx.clearRect(0, 0, boxW, boxH);

                    if (landmarks) {
                        const connections = FaceLandmarker.FACE_LANDMARKS_FACE_OVAL || [];
                        ctx.lineWidth = 2;
                        ctx.lineCap = "round";
                        ctx.strokeStyle = (
                            toneStyles[next.tone] || toneStyles.slate
                        ).stroke;
                        ctx.beginPath();
                        for (const { start, end } of connections) {
                            const [x1, y1] = project(landmarks[start]);
                            const [x2, y2] = project(landmarks[end]);
                            ctx.moveTo(x1, y1);
                            ctx.lineTo(x2, y2);
                        }
                        ctx.stroke();
                    }
                }
            } catch (err) {
                console.error("Face detection failed:", err);
            }
        };

        /* ---------- B) colour sampling (once per camera frame) ---------- */
        const onSample = (now) => {
            if (!scanningRef.current) return;

            const face = latestFaceRef.current;
            const fresh =
                face &&
                face.usable &&
                face.landmarks &&
                performance.now() - face.t < LANDMARK_MAX_AGE_MS;

            if (!fresh) {
                // face lost for too long -> restart the scan
                if (samplesRef.current.length && now - lastGoodRef.current > 2000) {
                    samplesRef.current = [];
                    setScan((s) => ({
                        ...s,
                        progress: 0,
                        bpm: null,
                        quality: null,
                        confidence: 0,
                        wave: [],
                        notice: "Face lost, scan restarted. Keep your face inside the oval.",
                    }));
                }
                return;
            }

            lastGoodRef.current = now;
            const rgb = extractRgb(video, face.landmarks);
            if (!rgb) return;

            const samples = samplesRef.current;
            samples.push({ t: now, ...rgb });

            const elapsed = now - samples[0].t;
            const done = elapsed >= SCAN_SECONDS * 1000;

            // update the UI once a second, not every frame
            if (!done && now - lastUiRef.current < 1000) return;
            lastUiRef.current = now;

            const fps = elapsed > 0 ? samples.length / (elapsed / 1000) : 0;
            const res = calculateBpm(samples);
            if (done) scanningRef.current = false;

            let notice = "";
            if (done && (!res || res.quality === "poor")) {
                notice = "Signal was weak. Try again in soft, even light and stay still.";
            } else if (!done && elapsed > 5000 && fps < LOW_FPS_WARNING) {
                notice = `Camera is only delivering ~${Math.round(fps)} fps, so accuracy will be low.`;
            }

            setScan({
                phase: done ? "done" : "measuring",
                progress: Math.min(1, elapsed / (SCAN_SECONDS * 1000)),
                bpm: res?.bpm ?? null,
                quality: res?.quality ?? null,
                confidence: res?.confidence ?? 0,
                wave: res?.wave ?? [],
                fps: Math.round(fps),
                notice,
            });
        };

        // requestVideoFrameCallback fires exactly once per real camera frame, with accurate timing.
        // Fallback: poll in requestAnimationFrame and skip repeated frames.
        let vfcId = null;
        let rafId = null;
        let lastSampleVideoTime = -1;

        if (typeof video.requestVideoFrameCallback === "function") {
            const loop = (now) => {
                vfcId = video.requestVideoFrameCallback(loop);
                onSample(now);
            };
            vfcId = video.requestVideoFrameCallback(loop);
        } else {
            const loop = (now) => {
                rafId = requestAnimationFrame(loop);
                if (video.currentTime === lastSampleVideoTime) return;
                lastSampleVideoTime = video.currentTime;
                onSample(now);
            };
            rafId = requestAnimationFrame(loop);
        }

        animationRef.current = requestAnimationFrame(detectFace);

        return () => {
            if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            if (rafId !== null) cancelAnimationFrame(rafId);
            if (vfcId !== null && typeof video.cancelVideoFrameCallback === "function") {
                video.cancelVideoFrameCallback(vfcId);
            }
            clearCanvas();
        };
    }, [status, detectorReady]);

    const isLive = status === "live";
    const isStarting = status === "starting";

    // what the user sees right now
    const activeGuide = !isLive
        ? null
        : detectorError
            ? null
            : !detectorReady
                ? GUIDES.loading
                : guide;

    const guideTone = activeGuide?.tone || "slate";
    const isReady = activeGuide?.key === "ready";

    const isMeasuring = scan.phase === "measuring";
    const isDone = scan.phase === "done";
    const secondsLeft = Math.ceil(SCAN_SECONDS * (1 - scan.progress));

    const combinedError = error || detectorError;

    // message under the BPM number
    let bpmMessage;
    if (isMeasuring) {
        bpmMessage =
            scan.bpm === null
                ? "Reading your pulse… hold still."
                : "Live estimate, it settles as the scan continues.";
    } else if (isDone) {
        bpmMessage = scan.bpm ? "Scan complete." : "No reliable reading this time.";
    } else if (!isLive) {
        bpmMessage = "Open your webcam to get ready.";
    } else if (isReady) {
        bpmMessage = "Face aligned. Press Start scan.";
    } else {
        bpmMessage = "Align your face in the oval to get ready.";
    }

    const miniStats = [
        { label: "Signal", value: scan.quality || "--", cls: qualityTone[scan.quality] },
        {
            label: "Progress",
            value: isMeasuring ? `${Math.round(scan.progress * 100)}%` : "--",
        },
        { label: "Signal Quality", value: scan.quality ? `${scan.confidence}%` : "--" },
    ];

    return (
        <div
            className="min-h-screen bg-slate-950 text-slate-100"
            style={displayFont}
        >
            <DashboardSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                navigate={navigate}
                handleLogout={handleLogout}
            />

            <div className="lg:pl-72">
                <DashboardHeader
                    greeting={greeting}
                    user={user}
                    userInitial={userInitial}
                    setSidebarOpen={setSidebarOpen}
                />

                <main className="mx-auto max-w-6xl px-6 py-8">
                    {/* Page heading */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div
                                className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-300"
                                style={monoFont}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Scans / Heart rate
                            </div>
                            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                Contactless heart rate
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
                                Estimate your pulse from subtle colour changes in your face, using
                                only your webcam. No wearable needed.
                            </p>
                        </div>

                        <div
                            className="flex items-center gap-2 text-xs text-slate-500"
                            style={monoFont}
                        >
                            <IconShield width={16} height={16} className="text-emerald-400" />
                            Video stays on your device
                        </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-5">
                        {/* ---------- Camera panel ---------- */}
                        <section className="lg:col-span-3">
                            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-[0_0_80px_-30px_rgba(52,211,153,0.25)]">
                                {/* top bar */}
                                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                                            <IconCam width={18} height={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                Camera preview
                                            </p>
                                            <p
                                                className="text-[11px] text-slate-500"
                                                style={monoFont}
                                            >
                                                {isLive && camInfo
                                                    ? `${camInfo.width || "?"}×${camInfo.height || "?"}${camInfo.fps ? ` · ${camInfo.fps} fps` : ""
                                                    }`
                                                    : "Not connected"}
                                            </p>
                                        </div>
                                    </div>

                                    <StatusPill status={status} />
                                </div>

                                {/* viewport */}
                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950 sm:aspect-video">
                                    <video
                                        ref={videoRef}
                                        playsInline
                                        muted
                                        autoPlay
                                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${isLive ? "opacity-100" : "opacity-0"
                                            }`}
                                        style={{ transform: "scaleX(-1)" }}
                                    />

                                    {/* face contour overlay (drawn by the detection loop) */}
                                    <canvas
                                        ref={canvasRef}
                                        className="pointer-events-none absolute inset-0 h-full w-full"
                                    />

                                    {/* subtle grid backdrop when idle */}
                                    {!isLive && (
                                        <div
                                            className="absolute inset-0 opacity-[0.07]"
                                            style={{
                                                backgroundImage:
                                                    "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                                                backgroundSize: "36px 36px",
                                            }}
                                        />
                                    )}

                                    {/* soft vignette */}
                                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(2,6,23,0.65)_100%)]" />

                                    {/* face guide */}
                                    <FaceGuide tone={isLive ? guideTone : "slate"} />

                                    {/* idle / starting overlay */}
                                    {!isLive && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                                            <div className="relative mb-5">
                                                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/10" />
                                                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                                                    <IconCam width={28} height={28} />
                                                </div>
                                            </div>

                                            <p className="text-lg font-medium text-white">
                                                {isStarting
                                                    ? "Waiting for camera permission…"
                                                    : "Camera is off"}
                                            </p>
                                            <p className="mt-1.5 max-w-xs text-sm text-slate-400">
                                                {isStarting
                                                    ? "Choose Allow in your browser prompt to continue."
                                                    : "Open your webcam to line up your face before scanning."}
                                            </p>
                                        </div>
                                    )}

                                    {/* live badge */}
                                    {isLive && (
                                        <div
                                            className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-[11px] uppercase tracking-widest text-slate-200 backdrop-blur"
                                            style={monoFont}
                                        >
                                            <span className="relative flex h-2 w-2">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
                                            </span>
                                            {isMeasuring ? `Scanning · ${secondsLeft}s` : "Live"}
                                        </div>
                                    )}

                                    {isLive && camInfo?.label && (
                                        <div
                                            className="absolute right-4 top-4 max-w-[45%] truncate rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-[11px] text-slate-300 backdrop-blur"
                                            style={monoFont}
                                        >
                                            {camInfo.label}
                                        </div>
                                    )}

                                    {/* real-time guidance */}
                                    {isLive && activeGuide && (
                                        <GuideBanner guide={activeGuide} />
                                    )}
                                </div>

                                {/* live checklist */}
                                <div className="grid grid-cols-3 gap-2 border-t border-slate-800 px-5 py-3">
                                    <CheckChip
                                        label="Face found"
                                        ok={isLive && !!activeGuide?.checks.found}
                                        active={isLive}
                                    />
                                    <CheckChip
                                        label="Centred"
                                        ok={isLive && !!activeGuide?.checks.centered}
                                        active={isLive}
                                    />
                                    <CheckChip
                                        label="Distance"
                                        ok={isLive && !!activeGuide?.checks.distance}
                                        active={isLive}
                                    />
                                </div>

                                {/* controls */}
                                <div className="flex flex-col gap-3 border-t border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    {isLive ? (
                                        <button
                                            type="button"
                                            onClick={stopWebcam}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 px-5 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
                                        >
                                            <IconStop width={16} height={16} />
                                            Close webcam
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={openWebcam}
                                            disabled={isStarting}
                                            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_8px_30px_-8px_rgba(52,211,153,0.6)] transition hover:bg-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isStarting ? (
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                                            ) : (
                                                <IconCam width={18} height={18} />
                                            )}
                                            {isStarting ? "Opening…" : "Open webcam"}
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={isMeasuring ? cancelScan : startScan}
                                        disabled={!isLive || (!isMeasuring && !isReady)}
                                        title={
                                            !isLive
                                                ? "Open the webcam first"
                                                : !isMeasuring && !isReady
                                                    ? "Align your face first"
                                                    : ""
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-5 py-2.5 text-sm font-medium text-emerald-200 transition hover:bg-emerald-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <IconHeart width={16} height={16} />
                                        {isMeasuring
                                            ? `Cancel (${secondsLeft}s)`
                                            : isDone
                                                ? "Scan again"
                                                : "Start scan"}
                                    </button>
                                </div>
                            </div>

                            {combinedError && (
                                <div
                                    role="alert"
                                    className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-300"
                                >
                                    <IconAlertTri
                                        width={18}
                                        height={18}
                                        className="mt-0.5 shrink-0"
                                    />
                                    <span>{combinedError}</span>
                                </div>
                            )}
                        </section>

                        {/* ---------- Side panel ---------- */}
                        <aside className="flex flex-col gap-5 lg:col-span-2">
                            {/* BPM card */}
                            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
                                <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

                                <div className="relative">
                                    <div className="flex items-center justify-between">
                                        <p
                                            className="text-[11px] uppercase tracking-[0.18em] text-slate-400"
                                            style={monoFont}
                                        >
                                            Heart rate
                                        </p>
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-400/10 text-rose-300">
                                            <IconHeart
                                                width={18}
                                                height={18}
                                                className={isMeasuring ? "animate-pulse" : ""}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-baseline gap-2">
                                        <span
                                            className="text-6xl font-semibold tracking-tight text-white"
                                            style={monoFont}
                                        >
                                            {scan.bpm ?? "--"}
                                        </span>
                                        <span className="text-sm text-slate-500" style={monoFont}>
                                            BPM
                                        </span>
                                    </div>

                                    <p className="mt-2 text-sm text-slate-400">{bpmMessage}</p>

                                    {isMeasuring && (
                                        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                                            <div
                                                className="h-full rounded-full bg-emerald-400 transition-all duration-1000 ease-linear"
                                                style={{ width: `${Math.round(scan.progress * 100)}%` }}
                                            />
                                        </div>
                                    )}

                                    {(isMeasuring || isDone) && scan.fps > 0 && (
                                        <p
                                            className="mt-2 text-[11px] text-slate-500"
                                            style={monoFont}
                                        >
                                            Sampling {scan.fps} frames/s
                                        </p>
                                    )}

                                    {scan.notice && (
                                        <p className="mt-3 text-xs leading-relaxed text-amber-300">
                                            {scan.notice}
                                        </p>
                                    )}

                                    {/* pulse waveform (flat line until the scan has data) */}
                                    <svg
                                        viewBox="0 0 300 60"
                                        className="mt-5 h-14 w-full"
                                        preserveAspectRatio="none"
                                        aria-hidden="true"
                                    >
                                        <defs>
                                            <linearGradient id="wave" x1="0" x2="1">
                                                <stop offset="0" stopColor="#34d399" stopOpacity="0.1" />
                                                <stop offset="0.5" stopColor="#34d399" stopOpacity="0.9" />
                                                <stop offset="1" stopColor="#a78bfa" stopOpacity="0.4" />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            d={wavePath(scan.wave)}
                                            fill="none"
                                            stroke="url(#wave)"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            opacity={scan.phase !== "idle" ? 1 : 0.35}
                                        />
                                    </svg>

                                    {/* mini stats */}
                                    <div className="mt-5 grid grid-cols-3 gap-3">
                                        {miniStats.map((item) => (
                                            <div
                                                key={item.label}
                                                className="rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-2.5"
                                            >
                                                <p
                                                    className="text-[10px] uppercase tracking-wider text-slate-500"
                                                    style={monoFont}
                                                >
                                                    {item.label}
                                                </p>
                                                <p
                                                    className={`mt-1 text-base capitalize ${item.cls || "text-slate-300"}`}
                                                    style={monoFont}
                                                >
                                                    {item.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                                <p
                                    className="text-[11px] uppercase tracking-[0.18em] text-slate-400"
                                    style={monoFont}
                                >
                                    For the best reading
                                </p>

                                <ul className="mt-4 space-y-4">
                                    {tips.map((tip) => {
                                        const Icon = tip.icon;
                                        return (
                                            <li key={tip.title} className="flex items-start gap-3.5">
                                                <div
                                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${toneClasses[tip.tone]
                                                        }`}
                                                >
                                                    <Icon width={18} height={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">
                                                        {tip.title}
                                                    </p>
                                                    <p className="mt-0.5 text-[13px] leading-relaxed text-slate-400">
                                                        {tip.body}
                                                    </p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            {/* Disclaimer */}
                            <p className="px-1 text-xs leading-relaxed text-slate-500">
                                This is a wellness estimate, not a medical measurement or
                                diagnosis. Speak to a doctor if you have health concerns.
                            </p>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    );
}

/* ---------- small pieces ---------- */

function StatusPill({ status }) {
    const map = {
        idle: {
            label: "Idle",
            cls: "border-slate-700 bg-slate-800/60 text-slate-400",
            dot: "bg-slate-500",
        },
        starting: {
            label: "Starting",
            cls: "border-amber-400/30 bg-amber-400/10 text-amber-300",
            dot: "bg-amber-400 animate-pulse",
        },
        live: {
            label: "Camera on",
            cls: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
            dot: "bg-emerald-400",
        },
        error: {
            label: "Error",
            cls: "border-rose-400/30 bg-rose-400/10 text-rose-300",
            dot: "bg-rose-400",
        },
    };

    const s = map[status] || map.idle;

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider ${s.cls}`}
            style={monoFont}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
}

// Oval + corner brackets. The oval uses the same size constants as the position check.
function FaceGuide({ tone }) {
    const t = toneStyles[tone] || toneStyles.slate;

    const corner = `absolute h-7 w-7 border-2 transition-colors duration-300 ${t.corner}`;

    return (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 transition-all duration-300 ${t.oval}`}
                style={{
                    height: `${OVAL_HEIGHT_RATIO * 100}%`,
                    aspectRatio: `${OVAL_ASPECT}`,
                }}
            />

            <span className={`${corner} left-5 top-14 rounded-tl-xl border-b-0 border-r-0`} />
            <span className={`${corner} right-5 top-14 rounded-tr-xl border-b-0 border-l-0`} />
            <span className={`${corner} bottom-5 left-5 rounded-bl-xl border-r-0 border-t-0`} />
            <span className={`${corner} bottom-5 right-5 rounded-br-xl border-l-0 border-t-0`} />
        </div>
    );
}

function GuideBanner({ guide }) {
    const t = toneStyles[guide.tone] || toneStyles.slate;
    const isReady = guide.key === "ready";
    const isLoading = guide.key === "loading" || guide.key === "searching";

    return (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
            <div
                role="status"
                aria-live="polite"
                className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 shadow-lg backdrop-blur transition-colors duration-300 ${t.pill}`}
            >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center ${t.icon}`}>
                    {isReady ? (
                        <IconCheck width={20} height={20} />
                    ) : isLoading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                    ) : (
                        <IconFace width={20} height={20} />
                    )}
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">{guide.message}</p>
                    <p className="mt-0.5 hidden text-xs leading-tight opacity-80 sm:block">
                        {guide.hint}
                    </p>
                </div>
            </div>
        </div>
    );
}

function CheckChip({ label, ok, active }) {
    const cls = !active
        ? "border-slate-800 bg-slate-950/40 text-slate-600"
        : ok
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
            : "border-slate-700 bg-slate-900/60 text-slate-400";

    return (
        <div
            className={`flex items-center justify-center gap-2 rounded-xl border px-2 py-2 text-[11px] uppercase tracking-wider transition-colors duration-300 ${cls}`}
            style={monoFont}
        >
            <span
                className={`flex h-4 w-4 items-center justify-center rounded-full ${ok && active ? "bg-emerald-400 text-slate-950" : "border border-current opacity-60"
                    }`}
            >
                {ok && active && <IconCheck width={11} height={11} strokeWidth={3} />}
            </span>
            {label}
        </div>
    );
}

export default Scans;
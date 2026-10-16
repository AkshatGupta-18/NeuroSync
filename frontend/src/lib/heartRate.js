export const SCAN_SECONDS = 30;

const FPS = 30;
const MIN_BPM = 45;
const MAX_BPM = 180;
const SETTLE_MS = 1500;  // ignore camera auto-exposure settling
const WINDOW_MS = 20000; // analyse the latest 20 s
const MIN_MS = 8000;     // need at least this much data

/* ---------- 1. average skin colour from forehead + cheeks ---------- */

const SIZE = 12;
let ctx = null;

function getCtx() {
    if (!ctx) {
        const c = document.createElement("canvas");
        c.width = SIZE;
        c.height = SIZE;
        ctx = c.getContext("2d", { willReadFrequently: true });
    }
    return ctx;
}

// landmarks are normalised to the raw (unmirrored) video, so no flipping needed
export function extractRgb(video, lm) {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const P = (i) => ({ x: lm[i].x * vw, y: lm[i].y * vh });
    const faceW = Math.hypot(P(454).x - P(234).x, P(454).y - P(234).y);

    const rois = [];

    // forehead: middle band between hairline (10) and eyebrows
    const top = P(10);
    const H = Math.min(P(105).y, P(334).y) - top.y;
    const left = P(67);
    const right = P(297);
    const fw = Math.abs(right.x - left.x);
    if (H > 0) {
        rois.push({
            x: Math.min(left.x, right.x) + fw * 0.15,
            y: top.y + H * 0.2,
            w: fw * 0.7,
            h: H * 0.55,
        });
    }

    // both cheeks
    for (const i of [50, 280]) {
        const c = P(i);
        rois.push({ x: c.x - faceW * 0.085, y: c.y - faceW * 0.065, w: faceW * 0.17, h: faceW * 0.13 });
    }

    const c2d = getCtx();
    let r = 0, g = 0, b = 0, used = 0;

    for (const roi of rois) {
        const x = Math.max(0, roi.x);
        const y = Math.max(0, roi.y);
        const w = Math.min(roi.w, vw - x);
        const h = Math.min(roi.h, vh - y);
        if (w < 4 || h < 4) continue;

        c2d.drawImage(video, x, y, w, h, 0, 0, SIZE, SIZE);
        const { data } = c2d.getImageData(0, 0, SIZE, SIZE);
        const n = data.length / 4;
        let pr = 0, pg = 0, pb = 0;
        for (let i = 0; i < data.length; i += 4) {
            pr += data[i];
            pg += data[i + 1];
            pb += data[i + 2];
        }
        r += pr / n;
        g += pg / n;
        b += pb / n;
        used++;
    }

    return used ? { r: r / used, g: g / used, b: b / used } : null;
}

/* ---------- 2. samples -> BPM ---------- */

// camera frames arrive at uneven times; interpolate onto an even 30 Hz grid
function resample(samples) {
    const n = samples.length;
    const t0 = samples[0].t;
    const step = 1000 / FPS;
    const count = Math.floor((samples[n - 1].t - t0) / step);
    if (count < 2) return null;

    const r = new Float64Array(count);
    const g = new Float64Array(count);
    const b = new Float64Array(count);
    let j = 0;

    for (let i = 0; i < count; i++) {
        const t = t0 + i * step;
        while (j < n - 2 && samples[j + 1].t < t) j++;
        const a = samples[j];
        const c = samples[j + 1];
        const k = Math.min(1, Math.max(0, (t - a.t) / (c.t - a.t || 1)));
        r[i] = a.r + (c.r - a.r) * k;
        g[i] = a.g + (c.g - a.g) * k;
        b[i] = a.b + (c.b - a.b) * k;
    }
    return { r, g, b };
}

function std(arr, mean) {
    let s = 0;
    for (let i = 0; i < arr.length; i++) s += (arr[i] - mean) ** 2;
    return Math.sqrt(s / arr.length);
}

// POS algorithm (Wang et al. 2017): turns R/G/B into a pulse waveform,
// cancelling most lighting and motion changes
function posSignal({ r, g, b }) {
    const N = r.length;
    const L = Math.round(1.6 * FPS);
    const out = new Float64Array(N);
    if (N < L) return out;

    const s1 = new Float64Array(L);
    const s2 = new Float64Array(L);

    for (let start = 0; start + L <= N; start++) {
        let mr = 0, mg = 0, mb = 0;
        for (let i = 0; i < L; i++) {
            mr += r[start + i];
            mg += g[start + i];
            mb += b[start + i];
        }
        mr /= L; mg /= L; mb /= L;
        if (!mr || !mg || !mb) continue;

        let m1 = 0, m2 = 0;
        for (let i = 0; i < L; i++) {
            const rn = r[start + i] / mr;
            const gn = g[start + i] / mg;
            const bn = b[start + i] / mb;
            s1[i] = gn - bn;
            s2[i] = gn + bn - 2 * rn;
            m1 += s1[i];
            m2 += s2[i];
        }
        m1 /= L; m2 /= L;

        const alpha = std(s1, m1) / (std(s2, m2) || 1e-9);

        let mh = 0;
        for (let i = 0; i < L; i++) mh += s1[i] + alpha * s2[i];
        mh /= L;

        for (let i = 0; i < L; i++) out[start + i] += s1[i] + alpha * s2[i] - mh;
    }
    return out;
}

// strongest frequency in the heart-rate band
function peakBpm(pulse) {
    const N = pulse.length;
    let mean = 0;
    for (let i = 0; i < N; i++) mean += pulse[i];
    mean /= N;

    const x = new Float64Array(N);
    for (let i = 0; i < N; i++) {
        const hann = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1));
        x[i] = (pulse[i] - mean) * hann;
    }

    const bpms = [];
    const power = [];
    let total = 0, bestP = -1, best = MIN_BPM;

    for (let bpm = MIN_BPM; bpm <= MAX_BPM; bpm += 0.5) {
        const w = (2 * Math.PI * (bpm / 60)) / FPS;
        let re = 0, im = 0;
        for (let i = 0; i < N; i++) {
            re += x[i] * Math.cos(w * i);
            im += x[i] * Math.sin(w * i);
        }
        const p = re * re + im * im;
        bpms.push(bpm);
        power.push(p);
        total += p;
        if (p > bestP) { bestP = p; best = bpm; }
    }

    // how much of the band's power sits near the peak = how clean the signal is
    let near = 0;
    for (let k = 0; k < bpms.length; k++) {
        if (Math.abs(bpms[k] - best) <= 6) near += power[k];
    }

    return { bpm: Math.round(best), snr: total ? near / total : 0 };
}

// samples: [{ t (ms), r, g, b }, ...]  ->  { bpm, quality, confidence, wave } or null
export function calculateBpm(samples) {
    if (samples.length < 2) return null;

    const last = samples[samples.length - 1].t;
    const from = Math.max(samples[0].t + SETTLE_MS, last - WINDOW_MS);
    const usable = samples.filter((s) => s.t >= from);
    if (usable.length < 2 || usable[usable.length - 1].t - usable[0].t < MIN_MS) return null;

    const rgb = resample(usable);
    if (!rgb) return null;

    const pulse = posSignal(rgb);
    const { bpm, snr } = peakBpm(pulse);

    return {
        bpm,
        // thresholds are provisional: re-tune after testing at a real ~30 fps
        quality: snr >= 0.3 ? "good" : snr >= 0.15 ? "fair" : "poor",
        confidence: Math.round(Math.min(1, snr / 0.5) * 100),
        snr,
        wave: Array.from(pulse.slice(-180)),
    };
}

/* ---------- 3. SVG path for the pulse waveform ---------- */

export function wavePath(wave) {
    if (!wave || wave.length < 10) return "M0 30 H300";
    const max = Math.max(...wave.map(Math.abs)) || 1;
    return wave
        .map((v, i) => {
            const x = (i / (wave.length - 1)) * 300;
            const y = 30 - (v / max) * 24;
            return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" ");
}
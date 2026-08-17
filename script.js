/* ============================================================
   script.js  —  Wedding Day Invitation & Countdown Logic
   ============================================================ */

/* ── 1. TARGET DATE ──────────────────────────────────────────
   Edit this single line to set your wedding date & time.
   Format: "YYYY-MM-DDTHH:MM:SS"  (ISO 8601, 24-hour clock)
   ──────────────────────────────────────────────────────────── */
const weddingDate = new Date("2026-09-06T19:00:00");

/* ── 2. ELEMENT REFERENCES ──────────────────────────────────── */
const daysEl        = document.getElementById("days");
const hoursEl       = document.getElementById("hours");
const minutesEl     = document.getElementById("minutes");
const secondsEl     = document.getElementById("seconds");
const gridEl        = document.getElementById("countdown-grid");
const celebrationEl = document.getElementById("celebration");

/* ── 3. HELPER: pad a number to 2 digits (e.g. 5 → "05") ──── */
function pad(n) {
    return String(n).padStart(2, "0");
}

/* ── 4. HELPER: animate a digit change with a quick flip ───── */
function updateWithFlip(el, newValue) {
    if (!el) return;
    const current = el.textContent;
    if (current === newValue) return; // nothing changed — skip animation

    /* Step 1: fade/scale the element out */
    el.classList.add("flip");

    /* Step 2: after the out-transition, swap the value and fade back in */
    setTimeout(() => {
        el.textContent = newValue;
        el.classList.remove("flip");
    }, 150); // matches transition duration in CSS (0.15s)
}

/* ── 5. MAIN TICK FUNCTION ───────────────────────────────────
   Called once immediately, then every second via setInterval.
   ─────────────────────────────────────────────────────────── */
function tick() {
    const now  = new Date();
    const diff = weddingDate - now; // milliseconds remaining

    /* ── Countdown has reached zero or date has passed ── */
    if (diff <= 0) {
        if (typeof intervalId !== "undefined") clearInterval(intervalId); // stop the clock

        /* Hide the counter grid, show the celebration message */
        if (gridEl) gridEl.hidden = true;
        if (celebrationEl) celebrationEl.hidden = false;
        return;
    }

    /* ── Calculate time components ── */
    const totalSeconds = Math.floor(diff / 1000);
    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    /* ── Update each element (with flip animation if value changed) ── */
    updateWithFlip(daysEl,    pad(days));
    updateWithFlip(hoursEl,   pad(hours));
    updateWithFlip(minutesEl, pad(minutes));
    updateWithFlip(secondsEl, pad(seconds));
}

/* ── 6. START THE COUNTDOWN ─────────────────────────────────
   Run once right away so there's no blank first second,
   then repeat every 1000 ms.
   ─────────────────────────────────────────────────────────── */
tick();
const intervalId = setInterval(tick, 1000);

/* ============================================================
   ENVELOPE OVERLAY & AUDIO TRIGGER
   ============================================================ */
const envelopeScreen = document.getElementById("envelope-screen");

if (envelopeScreen) {
    function openEnvelope() {
        if (envelopeScreen.classList.contains("opening")) return;
        
        // Add opening transition class (1.4s duration)
        envelopeScreen.classList.add("opening");

        // Reset and trigger staggered header animation so it plays visibly as envelope opens
        const headerStaggerEls = document.querySelectorAll(".header-stagger");
        headerStaggerEls.forEach((el) => el.classList.remove("in-view"));
        
        setTimeout(() => {
            headerStaggerEls.forEach((el) => el.classList.add("in-view"));
        }, 150);

        // If background audio element exists in project, trigger playback upon user interaction
        const audio = document.querySelector("audio");
        if (audio) {
            audio.play().catch(err => {
                console.log("Audio autoplay deferred:", err);
            });
        }

        // Restore page scrolling and remove overlay after transition completes
        setTimeout(() => {
            document.body.classList.remove("envelope-active");
            envelopeScreen.style.display = "none";
        }, 1400);
    }

    envelopeScreen.addEventListener("click", openEnvelope);
    envelopeScreen.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openEnvelope();
        }
    });
}

/* ============================================================
   SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    // 1. General sections reveal (animate ONCE and stay visible)
    const generalReveals = document.querySelectorAll(".reveal:not(.header-stagger)");

    if ("IntersectionObserver" in window) {
        const generalObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: "0px 0px -30px 0px",
            threshold: 0.1
        });

        generalReveals.forEach((el) => generalObserver.observe(el));

        // 2. Header Section staggered animation (REPEATS every time it re-enters viewport)
        const headerSection = document.getElementById("header-section") || document.querySelector(".header-section");
        const headerStaggerEls = document.querySelectorAll(".header-stagger");

        if (headerSection && headerStaggerEls.length > 0) {
            const headerObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    // Do not trigger under closed envelope overlay
                    if (document.body.classList.contains("envelope-active")) return;

                    if (entry.isIntersecting) {
                        // Re-trigger staggered fade-up animation
                        headerStaggerEls.forEach((el) => el.classList.add("in-view"));
                    } else {
                        // Reset when scrolled out of viewport so it re-animates when scrolling back up
                        headerStaggerEls.forEach((el) => el.classList.remove("in-view"));
                    }
                });
            }, {
                root: null,
                threshold: 0.12
            });

            headerObserver.observe(headerSection);
        }
    } else {
        // Fallback for legacy environments
        document.querySelectorAll(".reveal, .header-stagger").forEach((el) => el.classList.add("in-view"));
    }
});


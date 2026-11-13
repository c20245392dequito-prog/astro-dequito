const progressBar = document.createElement("div");
progressBar.className = "scroll-progress";
progressBar.setAttribute("role", "progressbar");
progressBar.setAttribute("aria-label", "Page scroll progress");
progressBar.setAttribute("aria-valuemin", "0");
progressBar.setAttribute("aria-valuemax", "100");
progressBar.setAttribute("aria-valuenow", "0");
document.body.prepend(progressBar);

let progressFrame = 0;

function updateProgress() {
    cancelAnimationFrame(progressFrame);
    progressFrame = requestAnimationFrame(() => {
        const scrollableHeight =
            document.documentElement.scrollHeight - window.innerHeight;
        const progress =
            scrollableHeight > 0
                ? Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100))
                : 100;

        progressBar.style.transform = `scaleX(${progress / 100})`;
        progressBar.setAttribute("aria-valuenow", String(Math.round(progress)));
    });
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

const replayButton = document.getElementById("replayAnimation");
const revealTargets = Array.from(document.querySelectorAll("[data-reveal]"));
const puzzleOffsets = [
    { x: -90, y: -70, rotation: -12 },
    { x: 80, y: -85, rotation: 10 },
    { x: -75, y: 90, rotation: 9 },
    { x: 95, y: 75, rotation: -11 },
    { x: 0, y: -110, rotation: 7 },
    { x: 0, y: 100, rotation: -8 },
];
const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
).matches;

if (revealTargets.length && !prefersReducedMotion) {
    revealTargets.forEach((target, index) => {
        const offset = puzzleOffsets[index % puzzleOffsets.length];
        target.style.setProperty("--puzzle-x", `${offset.x}px`);
        target.style.setProperty("--puzzle-y", `${offset.y}px`);
        target.style.setProperty("--puzzle-rotation", `${offset.rotation}deg`);
    });

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    revealTargets.forEach((target) => {
        target.classList.add("will-reveal");
        revealObserver.observe(target);
    });

    document.querySelectorAll("section").forEach((section) => {
        section.querySelectorAll("[data-reveal]").forEach((target, index) => {
            target.style.setProperty(
                "--reveal-delay",
                `${Math.min(index * 90, 360)}ms`,
            );
        });
    });

    replayButton?.addEventListener("click", () => {
        revealObserver.disconnect();
        revealTargets.forEach((target) => target.classList.remove("is-visible"));
        document.body.classList.remove("portfolio-reveal");
        void document.body.offsetWidth;
        document.body.classList.add("portfolio-reveal");
        requestAnimationFrame(() => {
            revealTargets.forEach((target) => revealObserver.observe(target));
        });
    });
} else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
    replayButton?.addEventListener("click", () => {
        document.body.classList.remove("portfolio-reveal");
        void document.body.offsetWidth;
        document.body.classList.add("portfolio-reveal");
    });
}

const themeButton = document.getElementById("darkModeToggle");
const themeLabel = document.getElementById("themeLabel");

function updateThemeButton(isDark) {
    if (!(themeButton instanceof HTMLButtonElement) || !themeLabel) {
        return;
    }

    themeLabel.textContent = isDark ? "Light Mode" : "Dark Mode";
    themeButton.setAttribute("aria-pressed", String(isDark));
    themeButton.setAttribute(
        "aria-label",
        `Switch to ${isDark ? "light" : "dark"} mode`,
    );
}

const savedTheme = localStorage.getItem("theme");
const isDarkInitially = savedTheme === "dark";
document.documentElement.classList.toggle("dark", isDarkInitially);
updateThemeButton(isDarkInitially);

themeButton?.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateThemeButton(isDark);
    themeButton.classList.remove("theme-toggle--flip");
    requestAnimationFrame(() => themeButton.classList.add("theme-toggle--flip"));
});
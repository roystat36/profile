/* =========================================================
   Statistical-notation background (all pages)
   - Formulas and tiny plots drift behind the content, with depth parallax.
   - Hover: nearby notation glows, steps aside, and shows its name.
   - Click on empty space: a normal curve blooms with sampled points.
   - Φ(z) gauge: reading progress shown as a standard normal CDF;
     click the curve to jump to that quantile of the page.
   - Σ button in the nav turns the background on/off (remembered).
   ========================================================= */
(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var root = document.documentElement;
    var body = document.body;
    function cssVar(n) { return getComputedStyle(root).getPropertyValue(n).trim(); }
    function rand(a, b) { return a + Math.random() * (b - a); }
    function randn() {
        var u = 1 - Math.random(), v = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    /* ---------- Notation library: [notation, name, topic] ---------- */
    var FORMULAS = [
        ["X ~ N(μ, σ²)", "Normal distribution", "prob"],
        ["f(x) = exp{−(x−μ)²/2σ²} / σ√(2π)", "Normal density", "prob"],
        ["P(X = k) = λᵏ e^(−λ) / k!", "Poisson pmf", "count"],
        ["P(X = k) = ⁿCₖ pᵏ (1 − p)ⁿ⁻ᵏ", "Binomial pmf", "prob"],
        ["E[X] = ∫ x f(x) dx", "Expectation", "prob"],
        ["Var(X) = E[X²] − (E[X])²", "Variance", "prob"],
        ["P(A | B) = P(B | A) P(A) / P(B)", "Bayes' theorem", "bayes"],
        ["x̄ = (1/n) Σ xᵢ", "Sample mean", "inference"],
        ["s² = Σ (xᵢ − x̄)² / (n − 1)", "Sample variance", "inference"],
        ["Z = (x̄ − μ) / (σ/√n)", "z-statistic", "inference"],
        ["t = (x̄ − μ₀) / (s/√n)", "One-sample t-statistic", "inference"],
        ["H₀: μ = μ₀   vs   H₁: μ ≠ μ₀", "Hypothesis test", "inference"],
        ["x̄ ± 1.96 σ/√n", "95% confidence interval", "inference"],
        ["χ² = Σ (Oᵢ − Eᵢ)² / Eᵢ", "Pearson's chi-square", "inference"],
        ["√n (x̄ₙ − μ) →ᵈ N(0, σ²)", "Central limit theorem", "theory"],
        ["P(|x̄ₙ − μ| > ε) → 0", "Weak law of large numbers", "theory"],
        ["ρ = Cov(X, Y) / √(Var X · Var Y)", "Correlation", "prob"],
        ["M(t) = E[exp(tX)]", "Moment generating function", "theory"],
        ["β̂ = (XᵀX)⁻¹ Xᵀy", "OLS estimator", "regression"],
        ["y = Xβ + ε,  ε ~ N(0, σ²I)", "Linear model", "regression"],
        ["log(p / (1 − p)) = β₀ + β₁x", "Logistic regression", "regression"],
        ["log E[Y | x] = xᵀβ", "Poisson regression (GLM)", "count"],
        ["Var(Y) = μ + μ²/k", "Negative binomial variance", "count"],
        ["R² = 1 − SSE / SST", "Coefficient of determination", "regression"],
        ["F = MSR / MSE", "ANOVA F-statistic", "regression"],
        ["h(t | x) = h₀(t) exp(xᵀβ)", "Cox proportional hazards", "survival"],
        ["Ŝ(t) = ∏ (1 − dᵢ/nᵢ),  tᵢ ≤ t", "Kaplan–Meier estimator", "survival"],
        ["MSE(θ̂) = Var(θ̂) + Bias(θ̂)²", "Bias–variance decomposition", "theory"],
        ["L(θ) = ∏ f(xᵢ | θ)", "Likelihood", "bayes"],
        ["ℓ(θ) = Σ log f(xᵢ | θ)", "Log-likelihood", "theory"],
        ["π(θ | x) ∝ L(θ) π(θ)", "Posterior ∝ likelihood × prior", "bayes"],
        ["I(θ) = −E[∂²ℓ / ∂θ²]", "Fisher information", "theory"],
        ["θ̂ ≈ N(θ, I(θ)⁻¹)", "Asymptotic distribution of the MLE", "theory"],
        ["p | k ~ Beta(α + k, β + n − k)", "Beta–binomial conjugacy", "bayes"],
        ["θ̂ = Σ wᵢθ̂ᵢ / Σ wᵢ,  wᵢ = 1/vᵢ", "Inverse-variance pooled estimate", "meta"],
        ["Q = Σ wᵢ (θ̂ᵢ − θ̂)²", "Cochran's Q", "meta"],
        ["I² = (Q − df) / Q", "Heterogeneity (I²)", "meta"],
        ["θ̂ᵢ ~ N(θ, vᵢ + τ²)", "Random-effects model", "meta"],
        ["Ŷ = Σ yᵢ / πᵢ", "Horvitz–Thompson estimator", "sampling"],
        ["wᵢ = 1 / πᵢ", "Design (sampling) weight", "sampling"],
        ["n = z² p(1 − p) / e²", "Sample size for a proportion", "sampling"],
        ["Deff = 1 + (m − 1)ρ", "Design effect", "sampling"],
        ["σ(z) = 1 / (1 + e⁻ᶻ)", "Logistic (sigmoid) function", "ml"],
        ["Accuracy = (TP + TN) / N", "Classification accuracy", "ml"],
        ["p < 5 × 10⁻⁸", "Genome-wide significance", "genomics"],
        ["−log₁₀(p)", "Manhattan-plot scale", "genomics"]
    ];
    var SYMBOLS = [
        ["μ", "Population mean"], ["σ²", "Variance"], ["Σ", "Summation"], ["∫", "Integral"],
        ["β̂", "Estimated coefficient"], ["θ̂", "Estimator"], ["x̄", "Sample mean"],
        ["χ²", "Chi-square"], ["λ", "Poisson rate"], ["α", "Significance level"], ["ρ", "Correlation"],
        ["ε", "Error term"], ["N(0, 1)", "Standard normal"], ["p̂", "Sample proportion"],
        ["Φ(z)", "Standard normal CDF"], ["τ²", "Between-study variance"], ["π(θ)", "Prior"], ["∞", "Infinity"]
    ];
    var SKETCHES = [
        ["normal", "Normal density"], ["hist", "Histogram"], ["scatter", "Scatter plot with OLS fit"],
        ["km", "Kaplan–Meier survival curve"], ["box", "Box plot"], ["poisson", "Poisson pmf (λ = 3)"],
        ["forest", "Forest plot (meta-analysis)"], ["qq", "Normal Q–Q plot"]
    ];
    // Topics each page leans towards (the rest of the library still appears)
    var PAGE_TOPICS = {
        "page-education": ["prob", "inference", "theory"],
        "page-experience": ["sampling", "regression", "ml"],
        "page-research": ["meta", "bayes", "regression", "count", "survival", "genomics", "ml"],
        "page-webapps": ["prob", "inference", "theory"]
    };
    var pageTopics = null;
    Object.keys(PAGE_TOPICS).forEach(function (k) { if (body.classList.contains(k)) pageTopics = PAGE_TOPICS[k]; });

    var FONT = "'Cambria Math', 'STIX Two Math', 'Latin Modern Math', 'Times New Roman', Times, serif";

    /* ---------- Canvas ---------- */
    var canvas = document.createElement("canvas");
    canvas.className = "stat-bg";
    canvas.setAttribute("aria-hidden", "true");
    body.insertBefore(canvas, body.firstChild);
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, dpr = 1, glyphs = [], blooms = [];
    var colors = {};
    var mouse = { x: -9999, y: -9999, overBlank: false };
    var column = { l: 0, r: 0 };
    var enabled = true;
    try { enabled = localStorage.getItem("statbg") !== "off"; } catch (e) { /* storage blocked */ }

    function readColors() {
        colors.ink = cssVar("--text");
        colors.accent = cssVar("--accent");
        colors.surface = cssVar("--surface");
        colors.dark = root.dataset.theme === "dark";
    }

    function pickFormula() {
        if (pageTopics && Math.random() < 0.6) {
            var pool = FORMULAS.filter(function (f) { return pageTopics.indexOf(f[2]) >= 0; });
            return pool[Math.floor(Math.random() * pool.length)];
        }
        return FORMULAS[Math.floor(Math.random() * FORMULAS.length)];
    }

    function makeGlyph() {
        var depth = rand(0.35, 1);
        var r = Math.random(), g = { depth: depth, x: rand(0, W), y: rand(0, H + 160),
            rot: rand(-0.18, 0.18), vrot: rand(-0.0006, 0.0006), vy: -rand(0.06, 0.2) * depth,
            sway: rand(0, Math.PI * 2), ox: 0, oy: 0, hover: 0 };
        if (r < 0.55) {
            var f = pickFormula();
            g.kind = "text"; g.text = f[0]; g.name = f[1]; g.size = 12 + depth * 9;
        } else if (r < 0.78) {
            var s = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            g.kind = "text"; g.text = s[0]; g.name = s[1]; g.size = 20 + depth * 22;
        } else {
            var k = SKETCHES[Math.floor(Math.random() * SKETCHES.length)];
            g.kind = "sketch"; g.sketch = k[0]; g.name = k[1]; g.size = 34 + depth * 36;
        }
        if (g.kind === "text") {
            // Combining hats/bars (β̂, x̄) render unevenly across fonts, so draw them by hand:
            // strip the marks and remember where each one sits.
            ctx.font = "italic " + g.size + "px " + FONT;
            ctx.textBaseline = "middle";
            g.plain = ""; g.marks = [];
            for (var i = 0; i < g.text.length; i++) {
                var ch = g.text[i];
                if (ch === "\u0302" || ch === "\u0304") {
                    var j = g.plain.length - 1;
                    var cm = ctx.measureText(g.plain[j]);
                    g.marks.push({ type: ch === "\u0302" ? "hat" : "bar",
                        x: ctx.measureText(g.plain.slice(0, j)).width, cw: cm.width,
                        top: -(cm.actualBoundingBoxAscent || g.size * 0.35) - g.size * 0.07 });
                } else g.plain += ch;
            }
            g.w = ctx.measureText(g.plain).width; g.h = g.size;
        } else {
            g.w = g.size; g.h = g.size * 0.7;
        }
        return g;
    }

    function measureColumn() {
        var main = document.querySelector("main");
        if (main) { var r = main.getBoundingClientRect(); column.l = r.left; column.r = r.right; }
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        measureColumn();
        var count = Math.max(16, Math.min(70, Math.round(W * H / 24000)));
        if (body.classList.contains("page-gallery")) count = Math.round(count * 0.6);
        glyphs = [];
        for (var i = 0; i < count; i++) glyphs.push(makeGlyph());
        if (!running()) drawFrame();
    }

    /* Softer behind the text column, fuller in the side margins */
    function columnFactor(x) {
        if (column.r - column.l > W * 0.9) return 0.45;
        var edge = 70;
        var d = Math.min(x - column.l, column.r - x);
        if (d <= 0) return 1;
        return d >= edge ? 0.35 : 1 - 0.65 * (d / edge);
    }

    /* ---------- Tiny plots ---------- */
    function drawSketch(g) {
        var s = g.size, c = ctx, i;
        c.lineWidth = 1.3;
        c.beginPath();
        switch (g.sketch) {
            case "normal":
                for (i = 0; i <= 40; i++) {
                    var x = -3 + 6 * i / 40, px = x / 6 * s, py = -Math.exp(-x * x / 2) * s * 0.55 + s * 0.25;
                    if (i) c.lineTo(px, py); else c.moveTo(px, py);
                }
                c.moveTo(-s / 2, s * 0.25); c.lineTo(s / 2, s * 0.25);
                break;
            case "hist":
                [1, 3, 6, 8, 6, 3, 1].forEach(function (h, j) {
                    var bw = s / 7;
                    c.rect(-s / 2 + j * bw, s * 0.3 - h / 8 * s * 0.6, bw, h / 8 * s * 0.6);
                });
                break;
            case "poisson":
                [0.05, 0.15, 0.22, 0.22, 0.17, 0.1, 0.05, 0.02].forEach(function (p, j) {
                    var x0 = -s / 2 + (j + 0.5) * s / 8, top = s * 0.3 - p / 0.22 * s * 0.55;
                    c.moveTo(x0, s * 0.3); c.lineTo(x0, top);
                    c.moveTo(x0 + 2, top); c.arc(x0, top, 2, 0, Math.PI * 2);
                });
                break;
            case "scatter":
                [[-0.4, 0.2], [-0.3, 0.12], [-0.2, 0.15], [-0.1, 0.02], [0, 0.04], [0.1, -0.06], [0.2, -0.02], [0.3, -0.14], [0.4, -0.12]].forEach(function (p) {
                    c.moveTo(p[0] * s + 1.8, p[1] * s); c.arc(p[0] * s, p[1] * s, 1.8, 0, Math.PI * 2);
                });
                c.moveTo(-0.45 * s, 0.21 * s); c.lineTo(0.45 * s, -0.16 * s);
                break;
            case "qq":
                [-0.4, -0.27, -0.15, -0.05, 0.05, 0.15, 0.27, 0.4].forEach(function (q, j) {
                    var y = -q * s * 0.7 + (j % 2 ? 0.02 : -0.02) * s;
                    c.moveTo(q * s + 1.8, y); c.arc(q * s, y, 1.8, 0, Math.PI * 2);
                });
                c.moveTo(-0.45 * s, 0.315 * s); c.lineTo(0.45 * s, -0.315 * s);
                break;
            case "km":
                var steps = [1, 0.86, 0.74, 0.6, 0.52, 0.4, 0.33, 0.25], sx = -s / 2;
                c.moveTo(sx, s * 0.3 - steps[0] * s * 0.6);
                steps.forEach(function (v, j) {
                    var nx = sx + s / steps.length;
                    c.lineTo(nx, s * 0.3 - v * s * 0.6);
                    if (j + 1 < steps.length) c.lineTo(nx, s * 0.3 - steps[j + 1] * s * 0.6);
                    sx = nx;
                });
                c.moveTo(-s / 2, s * 0.3); c.lineTo(s / 2, s * 0.3);
                c.moveTo(-s / 2, s * 0.3); c.lineTo(-s / 2, -s * 0.32);
                break;
            case "box":
                c.moveTo(-s / 2, 0); c.lineTo(-s / 4, 0);
                c.moveTo(s / 2, 0); c.lineTo(s / 4, 0);
                c.moveTo(-s / 2, -s * 0.08); c.lineTo(-s / 2, s * 0.08);
                c.moveTo(s / 2, -s * 0.08); c.lineTo(s / 2, s * 0.08);
                c.rect(-s / 4, -s * 0.15, s / 2, s * 0.3);
                c.moveTo(-s * 0.03, -s * 0.15); c.lineTo(-s * 0.03, s * 0.15);
                break;
            case "forest":
                [[-0.12, 0.18], [0.08, 0.14], [-0.02, 0.22], [0.1, 0.12]].forEach(function (r, j) {
                    var y = -s * 0.3 + j * s * 0.15, cx = r[0] * s;
                    c.moveTo(cx - r[1] * s, y); c.lineTo(cx + r[1] * s, y);
                    c.rect(cx - 2.5, y - 2.5, 5, 5);
                });
                var dy = s * 0.32, dc = 0.01 * s;
                c.moveTo(dc - s * 0.1, dy); c.lineTo(dc, dy - 5); c.lineTo(dc + s * 0.1, dy); c.lineTo(dc, dy + 5); c.closePath();
                c.moveTo(0, -s * 0.4); c.lineTo(0, s * 0.42);
                break;
        }
        c.stroke();
    }

    /* ---------- Drawing ---------- */
    var scrollY = window.scrollY, parX = 0, parY = 0;

    function screenPos(g) {
        var span = H + 160;
        var y = ((g.y - scrollY * g.depth * 0.25) % span + span) % span - 80;
        var x = g.x + Math.sin(g.sway) * 6 + parX * g.depth;
        return { x: x + g.ox, y: y + parY * g.depth + g.oy };
    }

    function drawGlyph(g, p) {
        var base = (colors.dark ? 0.1 : 0.12) + g.depth * (colors.dark ? 0.1 : 0.11);
        var a = base * columnFactor(p.x);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(g.rot);
        var layers = [[colors.ink, a * (1 - g.hover)]];
        if (g.hover > 0.02) layers.push([colors.accent, Math.min(0.9, 0.25 + a) * g.hover]);
        layers.forEach(function (l) {
            if (l[1] <= 0.003) return;
            ctx.globalAlpha = l[1];
            ctx.fillStyle = ctx.strokeStyle = l[0];
            if (g.kind === "text") {
                ctx.font = "italic " + g.size + "px " + FONT;
                ctx.textAlign = "left"; ctx.textBaseline = "middle";
                ctx.fillText(g.plain, -g.w / 2, 0);
                if (g.marks.length) {
                    ctx.lineWidth = Math.max(1, g.size * 0.06);
                    ctx.beginPath();
                    g.marks.forEach(function (m) {
                        // italic letters lean right, so taller letters need the mark shifted further
                        var x0 = -g.w / 2 + m.x - m.top * 0.18, top = m.top;
                        if (m.type === "hat") {
                            ctx.moveTo(x0 + m.cw * 0.18, top);
                            ctx.lineTo(x0 + m.cw * 0.5, top - g.size * 0.13);
                            ctx.lineTo(x0 + m.cw * 0.82, top);
                        } else {
                            ctx.moveTo(x0 + m.cw * 0.12, top - g.size * 0.02);
                            ctx.lineTo(x0 + m.cw * 0.88, top - g.size * 0.02);
                        }
                    });
                    ctx.stroke();
                }
            } else {
                drawSketch(g);
            }
        });
        ctx.restore();
    }

    function drawLabel(g, p) {
        if (g.hover < 0.3) return;
        ctx.save();
        ctx.font = "bold 12px Arial, sans-serif";
        var tw = ctx.measureText(g.name).width;
        var lx = Math.max(6, Math.min(W - tw - 18, p.x - tw / 2 - 6)), ly = p.y + g.h / 2 + 8;
        ctx.globalAlpha = 0.92 * g.hover;
        ctx.fillStyle = colors.surface;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(lx, ly, tw + 12, 20, 10); else ctx.rect(lx, ly, tw + 12, 20);
        ctx.fill();
        ctx.strokeStyle = colors.accent; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = colors.accent;
        ctx.textBaseline = "middle"; ctx.textAlign = "left";
        ctx.fillText(g.name, lx + 6, ly + 10.5);
        ctx.restore();
    }

    function drawBloom(b, now) {
        var t = (now - b.t0) / 1700;
        if (t >= 1) return false;
        var grow = Math.min(1, t / 0.35), fade = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
        var sd = 34 * (0.4 + 0.6 * grow), h = 70 * grow, i, x;
        ctx.save();
        ctx.globalAlpha = 0.55 * fade;
        ctx.strokeStyle = ctx.fillStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (i = 0; i <= 60; i++) {
            var z = -3.5 + 7 * i / 60;
            x = b.x + z * sd;
            var y = b.y - Math.exp(-z * z / 2) * h;
            if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 0.12 * fade;
        ctx.lineTo(b.x + 3.5 * sd, b.y); ctx.lineTo(b.x - 3.5 * sd, b.y); ctx.closePath(); ctx.fill();
        // μ and ±σ markers
        ctx.globalAlpha = 0.7 * fade;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x, b.y - h); ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "italic 15px " + FONT; ctx.textAlign = "center";
        ctx.fillText("μ", b.x, b.y + 16);
        ctx.font = "italic 12px " + FONT;
        ctx.fillText("−σ", b.x - sd, b.y + 15); ctx.fillText("+σ", b.x + sd, b.y + 15);
        // sampled points dropping onto the axis
        b.pts.forEach(function (pt, k) {
            var tt = Math.max(0, Math.min(1, (t - 0.15 - k * 0.02) / 0.3));
            if (tt <= 0) return;
            ctx.globalAlpha = 0.8 * fade;
            ctx.beginPath();
            ctx.arc(b.x + pt * sd, b.y - h * 0.9 * (1 - tt) * (1 - tt) - 3, 2.6, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
        return true;
    }

    function drawFrame(now) {
        now = now || performance.now();
        ctx.clearRect(0, 0, W, H);
        if (!enabled) return;
        var best = null;
        glyphs.forEach(function (g) {
            var p = screenPos(g);
            g._p = p;
            if (p.y < -90 || p.y > H + 90) return;
            drawGlyph(g, p);
            if (g.hover > 0.3 && (!best || g.hover > best.hover)) best = g;
        });
        if (best && mouse.overBlank) drawLabel(best, best._p);
        blooms = blooms.filter(function (b) { return drawBloom(b, now); });
    }

    function step() {
        glyphs.forEach(function (g) {
            g.y += g.vy;
            g.sway += 0.004;
            g.rot += g.vrot;
            var p = g._p || screenPos(g);
            var dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
            var R = 120;
            if (d < R && d > 0.1) {
                var push = (R - d) / R;
                g.ox += dx / d * push * 1.6;
                g.oy += dy / d * push * 1.6;
            }
            g.ox *= 0.94; g.oy *= 0.94;
            var inside = Math.abs(dx) < g.w / 2 + 26 && Math.abs(dy) < g.h / 2 + 26;
            g.hover += ((inside ? 1 : 0) - g.hover) * 0.12;
        });
        var tx = (mouse.x > -999 ? (W / 2 - mouse.x) * 0.02 : 0), ty = (mouse.y > -999 ? (H / 2 - mouse.y) * 0.015 : 0);
        parX += (tx - parX) * 0.05; parY += (ty - parY) * 0.05;
    }

    var rafId = null;
    function running() { return rafId !== null; }
    function loop(now) {
        if (!document.hidden) { step(); drawFrame(now); }
        rafId = requestAnimationFrame(loop);
    }
    function start() { if (!reduceMotion && enabled && !running()) rafId = requestAnimationFrame(loop); }
    function stop() { if (running()) cancelAnimationFrame(rafId); rafId = null; }

    /* ---------- Events ---------- */
    var BLANK = "html, body, main, section, .hero, .name, .galton-wrap, .main-content, .left-column, .right-column, .timeline, .gallery, .research, .education, .experience, .experience-details, .stats, .social-icons";
    window.addEventListener("mousemove", function (e) {
        mouse.x = e.clientX; mouse.y = e.clientY;
        mouse.overBlank = !!(e.target && e.target.matches && e.target.matches(BLANK));
    }, { passive: true });
    document.addEventListener("mouseleave", function () { mouse.x = mouse.y = -9999; });
    window.addEventListener("scroll", function () {
        scrollY = window.scrollY;
        if (!running()) drawFrame();
    }, { passive: true });

    document.addEventListener("click", function (e) {
        if (!enabled || reduceMotion) return;
        // only bloom on empty background, never on text, cards or controls
        if (!(e.target.matches && e.target.matches(BLANK))) return;
        var sel = window.getSelection && window.getSelection();
        if (sel && String(sel).length) return;
        var pts = [];
        for (var i = 0; i < 14; i++) pts.push(Math.max(-3, Math.min(3, randn())));
        blooms.push({ x: e.clientX, y: e.clientY, t0: performance.now(), pts: pts });
        if (blooms.length > 6) blooms.shift();
    });

    var resizeTimer;
    window.addEventListener("resize", function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
    document.addEventListener("themechange", function () { readColors(); if (!running()) drawFrame(); });

    /* ---------- Σ toggle in the nav ---------- */
    var nav = document.querySelector("nav");
    if (nav) {
        var btn = document.createElement("button");
        btn.className = "nav-btn bg-toggle";
        btn.textContent = "Σ";
        var syncBtn = function () {
            btn.classList.toggle("off", !enabled);
            btn.setAttribute("aria-pressed", String(enabled));
            btn.title = enabled ? "Hide the statistical background" : "Show the statistical background";
            btn.setAttribute("aria-label", btn.title);
        };
        btn.addEventListener("click", function () {
            enabled = !enabled;
            try { localStorage.setItem("statbg", enabled ? "on" : "off"); } catch (e) { /* storage blocked */ }
            canvas.hidden = !enabled;
            syncBtn();
            if (enabled) { start(); drawFrame(); } else { stop(); ctx.clearRect(0, 0, W, H); }
        });
        syncBtn();
        nav.insertBefore(btn, nav.querySelector(".theme-toggle"));
    }

    /* ---------- Φ(z) reading-progress gauge ---------- */
    function invNorm(p) { // Acklam's rational approximation, relative error < 1.2e-9
        var a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239],
            b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572],
            c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783],
            d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416], q, r;
        if (p < 0.02425) {
            q = Math.sqrt(-2 * Math.log(p));
            return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
        }
        if (p > 1 - 0.02425) {
            q = Math.sqrt(-2 * Math.log(1 - p));
            return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
        }
        q = p - 0.5; r = q * q;
        return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    }
    function normCdf(z) { // via erf, Abramowitz & Stegun 7.1.26
        var x = Math.abs(z) / Math.SQRT2, t = 1 / (1 + 0.3275911 * x);
        var e = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
        return z < 0 ? 0.5 * (1 - e) : 0.5 * (1 + e);
    }

    var gauge = document.createElement("div");
    gauge.className = "phi-gauge";
    gauge.title = "Reading progress as a standard normal CDF. Click the curve to jump to that point of the page.";
    gauge.innerHTML = '<canvas></canvas><div class="phi-label"></div>';
    body.appendChild(gauge);
    var gc = gauge.querySelector("canvas"), gctx = gc.getContext("2d"), glabel = gauge.querySelector(".phi-label");
    var GW = 132, GH = 46, ZMAX = 3.2;
    (function () {
        var r = Math.min(window.devicePixelRatio || 1, 2);
        gc.width = GW * r; gc.height = GH * r; gc.style.width = GW + "px"; gc.style.height = GH + "px";
        gctx.setTransform(r, 0, 0, r, 0, 0);
    })();
    function gx(z) { return 4 + (z + ZMAX) / (2 * ZMAX) * (GW - 8); }
    function gy(z) { return GH - 4 - Math.exp(-z * z / 2) * (GH - 10); }

    function drawGauge() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        gauge.classList.toggle("show", max > 300 && window.scrollY > 80);
        var p = max > 0 ? Math.min(0.999, Math.max(0.001, window.scrollY / max)) : 0.001;
        var z = Math.max(-ZMAX, Math.min(ZMAX, invNorm(p)));
        gctx.clearRect(0, 0, GW, GH);
        var i, x;
        // shaded area = Φ(z)
        gctx.fillStyle = colors.accent;
        gctx.globalAlpha = 0.3;
        gctx.beginPath(); gctx.moveTo(gx(-ZMAX), GH - 4);
        for (i = 0; i <= 60; i++) { x = -ZMAX + (z + ZMAX) * i / 60; gctx.lineTo(gx(x), gy(x)); }
        gctx.lineTo(gx(z), GH - 4); gctx.closePath(); gctx.fill();
        gctx.globalAlpha = 1;
        gctx.strokeStyle = colors.ink; gctx.lineWidth = 1.2;
        gctx.beginPath();
        for (i = 0; i <= 80; i++) { x = -ZMAX + 2 * ZMAX * i / 80; if (i) gctx.lineTo(gx(x), gy(x)); else gctx.moveTo(gx(x), gy(x)); }
        gctx.moveTo(gx(-ZMAX), GH - 4); gctx.lineTo(gx(ZMAX), GH - 4);
        gctx.stroke();
        gctx.strokeStyle = colors.accent; gctx.lineWidth = 1.5;
        gctx.beginPath(); gctx.moveTo(gx(z), GH - 4); gctx.lineTo(gx(z), gy(z) - 2); gctx.stroke();
        glabel.textContent = "Φ(" + (z >= 0 ? "" : "−") + Math.abs(z).toFixed(2) + ") = " + p.toFixed(2);
    }
    var gTick = false;
    window.addEventListener("scroll", function () {
        if (!gTick) { gTick = true; requestAnimationFrame(function () { drawGauge(); gTick = false; }); }
    }, { passive: true });
    window.addEventListener("resize", function () { measureColumn(); drawGauge(); });
    document.addEventListener("themechange", drawGauge);
    gc.addEventListener("click", function (e) {
        var r = gc.getBoundingClientRect();
        var z = ((e.clientX - r.left) - 4) / (GW - 8) * 2 * ZMAX - ZMAX;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: normCdf(z) * max });
    });

    /* ---------- Go ---------- */
    readColors();
    canvas.hidden = !enabled;
    resize();
    drawGauge();
    if (reduceMotion) drawFrame(); else start();
})();
